"use client"

import type React from "react"

import { useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction } from "@solana/web3.js"
import {
  createMintToInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getMint,
  getAccount,
} from "@solana/spl-token"
import { Loader2 } from 'lucide-react'
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { WalletStatus } from "@/components/wallet-status"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export function MintToken() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [mintAddress, setMintAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [mintInfo, setMintInfo] = useState<{
    decimals: number
    mintAuthority: string | null
  } | null>(null)
  const { toast } = useToast()

  const handleVerifyMint = async () => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint tokens.",
        variant: "destructive",
      })
      return
    }

    if (!mintAddress) {
      toast({
        title: "Missing mint address",
        description: "Please enter a valid mint address.",
        variant: "destructive",
      })
      return
    }

    try {
      setVerifying(true)

      // Validate the mint address
      let mintPublicKey: PublicKey
      try {
        mintPublicKey = new PublicKey(mintAddress)
      } catch (error) {
        toast({
          title: "Invalid mint address",
          description: "The provided address is not a valid Solana address.",
          variant: "destructive",
        })
        return
      }

      // Get the mint info
      const mintInfo = await getMint(connection, mintPublicKey)

      // Check if the connected wallet is the mint authority
      if (!mintInfo.mintAuthority || !mintInfo.mintAuthority.equals(publicKey)) {
        toast({
          title: "Not authorized",
          description: "Your wallet is not the mint authority for this token.",
          variant: "destructive",
        })
        return
      }

      setMintInfo({
        decimals: mintInfo.decimals,
        mintAuthority: mintInfo.mintAuthority?.toString() || null,
      })

      toast({
        title: "Mint verified",
        description: "You are authorized to mint this token.",
      })
    } catch (error) {
      console.error("Error verifying mint:", error)
      toast({
        title: "Error verifying mint",
        description: `${error instanceof Error ? error.message : "Unknown error occurred"}`,
        variant: "destructive",
      })
      setMintInfo(null)
    } finally {
      setVerifying(false)
    }
  }

  const handleMintToken = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!publicKey || !mintInfo) {
      toast({
        title: "Cannot mint tokens",
        description: "Please verify the mint address first.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const mintPublicKey = new PublicKey(mintAddress)

      // Calculate the amount to mint based on decimals
      const mintAmount = BigInt(Number.parseFloat(amount) * 10 ** mintInfo.decimals)

      // Get the associated token account for the recipient (in this case, the connected wallet)
      const associatedTokenAddress = await getAssociatedTokenAddress(mintPublicKey, publicKey)

      // Check if the associated token account exists
      const transaction = new Transaction()

      try {
        await getAccount(connection, associatedTokenAddress)
      } catch (error) {
        // If the account doesn't exist, create it
        transaction.add(
          createAssociatedTokenAccountInstruction(publicKey, associatedTokenAddress, publicKey, mintPublicKey)
        )
      }

      // Add instruction to mint tokens
      transaction.add(createMintToInstruction(mintPublicKey, associatedTokenAddress, publicKey, Number(mintAmount)))

      // Send the transaction
      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, "confirmed")

      toast({
        title: "Tokens minted successfully!",
        description: `${amount} tokens have been minted to your wallet.`,
      })

      // Reset the form
      setAmount("")
    } catch (error) {
      console.error("Error minting tokens:", error)
      toast({
        title: "Error minting tokens",
        description: `${error instanceof Error ? error.message : "Unknown error occurred"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DynamicNavbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mint Tokens</h1>

        <WalletStatus />

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Mint Additional Tokens</CardTitle>
              <CardDescription>Mint additional tokens to an existing SPL token mint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mintAddress">Token Mint Address</Label>
                <div className="flex space-x-2">
                  <Input
                    id="mintAddress"
                    placeholder="Enter the token mint address"
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                    disabled={verifying || !!mintInfo}
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyMint}
                    disabled={verifying || !mintAddress || !publicKey || !!mintInfo}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              </div>

              {mintInfo && (
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm mb-1">
                    <span className="font-semibold">Decimals:</span> {mintInfo.decimals}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Mint Authority:</span> {mintInfo.mintAuthority}
                  </p>
                </div>
              )}

              <form onSubmit={handleMintToken}>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Mint</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount to mint"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading || !mintInfo}
                    required
                    min="0"
                    step="any"
                  />
                  {mintInfo && (
                    <p className="text-sm text-muted-foreground">
                      This will mint {amount || "0"} tokens with {mintInfo.decimals} decimals.
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !mintInfo || !amount || Number.parseFloat(amount) <= 0 || !publicKey}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Minting Tokens...
                      </>
                    ) : (
                      "Mint Tokens"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default MintToken

