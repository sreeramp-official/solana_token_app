"use client"

import { useEffect, useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Loader2, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { DynamicNavbar } from "@/components/navbar"
import { WalletStatus } from "@/components/wallet-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface ParsedTransaction {
  signature: string
  timestamp: Date | null
  status: "success" | "error"
  blockTime: number | null
}

export function TransactionHistory() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const { toast } = useToast()

  const fetchTransactions = async (before?: string) => {
    if (!publicKey) return

    try {
      setLoading(true)

      // Fetch signatures
      const signatures = await connection.getSignaturesForAddress(publicKey, { before, limit: 10 })

      if (signatures.length < 10) {
        setHasMore(false)
      }

      // Parse transactions
      const parsedTransactions: ParsedTransaction[] = signatures.map((sig) => ({
        signature: sig.signature,
        timestamp: sig.blockTime ? new Date(sig.blockTime * 1000) : null,
        status: sig.err ? "error" : "success",
        blockTime: sig.blockTime,
      }))

      setTransactions((prev) => (before ? [...prev, ...parsedTransactions] : parsedTransactions))
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Error fetching transactions",
        description: "Failed to load your transaction history.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = async () => {
    if (!transactions.length || loadingMore) return

    setLoadingMore(true)
    const lastSignature = transactions[transactions.length - 1].signature
    await fetchTransactions(lastSignature)
  }

  useEffect(() => {
    if (publicKey) {
      fetchTransactions()
    } else {
      setTransactions([])
      setHasMore(true)
    }
  }, [publicKey])

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown"
    return date.toLocaleString()
  }

  const getExplorerUrl = (signature: string) => {
    return `https://explorer.solana.com/tx/${signature}?cluster=devnet`
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DynamicNavbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Transaction History</h1>

        <WalletStatus />

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>View your recent transactions on the Solana blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && transactions.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading transactions...</span>
                </div>
              ) : transactions.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div key={tx.signature} className="p-4 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                          {tx.status === "success" ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          <div>
                            <p className="font-medium">
                              {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                            </p>
                            <p className="text-sm text-muted-foreground">{formatDate(tx.timestamp)}</p>
                          </div>
                        </div>
                        <a
                          href={getExplorerUrl(tx.signature)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-500 hover:text-blue-700"
                        >
                          View <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-6 flex justify-center">
                      <Button onClick={loadMore} disabled={loadingMore} variant="outline">
                        {loadingMore ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {publicKey
                      ? "No transactions found for this wallet."
                      : "Connect your wallet to view your transaction history."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default TransactionHistory

