"use client"

import { useState, useEffect } from "react"
import { useConnection } from "@solana/wallet-adapter-react"
import type { PublicKey } from "@solana/web3.js"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface TokenAccount {
  pubkey: PublicKey
  account: {
    mint: PublicKey
    owner: PublicKey
    amount: bigint
  }
}

interface TokenBalanceProps {
  tokenAccount: TokenAccount
}

interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
}

export function TokenBalance({ tokenAccount }: TokenBalanceProps) {
  const { connection } = useConnection()
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  // Handle SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const fetchTokenMetadata = async () => {
      try {
        setLoading(true)

        // In a real app, you would fetch token metadata from a token registry or metadata program
        // For simplicity, we're creating placeholder metadata here
        // In production, you'd use the Metaplex SDK to fetch actual metadata

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Generate placeholder metadata based on mint address
        const mintAddress = tokenAccount.account.mint.toString()
        const placeholderMetadata = {
          name: `Token ${mintAddress.slice(0, 4)}...${mintAddress.slice(-4)}`,
          symbol: `TKN${mintAddress.slice(0, 2)}`,
          decimals: 9, // Most SPL tokens use 9 decimals
        }

        setMetadata(placeholderMetadata)
      } catch (error) {
        console.error("Error fetching token metadata:", error)
        toast({
          title: "Error fetching token metadata",
          description: "Failed to load token information.",
          variant: "destructive",
        })

        // Set fallback metadata
        setMetadata({
          name: "Unknown Token",
          symbol: "???",
          decimals: 9,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTokenMetadata()
  }, [tokenAccount, connection, toast, mounted])

  const formatAmount = (amount: bigint, decimals: number): string => {
    const divisor = BigInt(10) ** BigInt(decimals)
    const integerPart = amount / divisor
    const fractionalPart = amount % divisor

    let fractionalStr = fractionalPart.toString().padStart(decimals, "0")
    // Trim trailing zeros
    fractionalStr = fractionalStr.replace(/0+$/, "")

    if (fractionalStr.length > 0) {
      return `${integerPart}.${fractionalStr}`
    }

    return integerPart.toString()
  }

  if (!mounted) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        {loading ? (
          <CardTitle className="flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </CardTitle>
        ) : (
          <>
            <CardTitle>{metadata?.name || "Unknown Token"}</CardTitle>
            <CardDescription>
              {metadata?.symbol || "???"} • Mint: {tokenAccount.account.mint.toString().slice(0, 4)}...
              {tokenAccount.account.mint.toString().slice(-4)}
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading balance...
          </div>
        ) : (
          <p className="text-2xl font-bold">
            {formatAmount(tokenAccount.account.amount, metadata?.decimals || 9)} {metadata?.symbol || "???"}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

