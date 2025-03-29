"use client"

import { useEffect, useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { Loader2 } from "lucide-react"
import { DynamicNavbar } from "@/components/navbar"
import { TokenBalance } from "@/components/token-balance"
import { WalletStatus } from "@/components/wallet-status"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TokenAccount {
  pubkey: PublicKey
  account: {
    mint: PublicKey
    owner: PublicKey
    amount: bigint
  }
}

export function Dashboard() {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTokenAccounts = async () => {
      if (!publicKey || !connected) {
        setTokenAccounts([])
        setSolBalance(null)
        return
      }

      try {
        setLoading(true)
        // Fetch SOL balance
        const balance = await connection.getBalance(publicKey)
        setSolBalance(balance / 10 ** 9) // Convert lamports to SOL

        // Fetch token accounts
        const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID })

        const tokenAccts = accounts.value.map((account) => {
          const parsedInfo = account.account.data.parsed.info
          return {
            pubkey: account.pubkey,
            account: {
              mint: new PublicKey(parsedInfo.mint),
              owner: new PublicKey(parsedInfo.owner),
              amount: BigInt(parsedInfo.tokenAmount.amount),
            },
          }
        })

        setTokenAccounts(tokenAccts)
      } catch (error) {
        console.error("Error fetching token accounts:", error)
        toast({
          title: "Error fetching token accounts",
          description: "Failed to load your token accounts. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTokenAccounts()

    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchTokenAccounts, 30000)
    return () => clearInterval(intervalId)
  }, [publicKey, connected, connection, toast])

  return (
    <>
      <DynamicNavbar />
      <div className="flex flex-col mt-16">
        <main className="container mx-auto px-4 py-8">
          <WalletStatus />

          {connected && publicKey ? (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Column: SOL Balance */}
              <div className="flex-1">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>SOL Balance</CardTitle>
                    <CardDescription>Your native SOL balance</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80 flex items-center justify-center">
                    {solBalance !== null ? (
                      <p className="font-bold text-3xl">{solBalance.toFixed(6)} SOL</p>
                    ) : (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Tokens */}
              <div className="flex-1">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Your Tokens</CardTitle>
                    <CardDescription>Manage your SPL tokens</CardDescription>
                  </CardHeader>
                  {/* Fixed height with vertical scrolling */}
                  <CardContent className="h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin mr-2" />
                        <span>Loading token accounts...</span>
                      </div>
                    ) : tokenAccounts.length > 0 ? (
                      <div className="space-y-4">
                        {tokenAccounts.map((account) => (
                          <TokenBalance key={account.pubkey.toString()} tokenAccount={account} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-center text-muted-foreground">
                          No token accounts found. Create or receive tokens to see them here.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">
                  Connect your wallet to view your dashboard.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  )
}

export default Dashboard
