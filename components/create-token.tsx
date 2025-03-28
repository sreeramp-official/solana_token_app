"use client"

import { useEffect, useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction, Keypair } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { Loader2 } from 'lucide-react'
import { DynamicNavbar } from "@/components/navbar"
import { WalletStatus } from "@/components/wallet-status"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  getMinimumBalanceForRentExemptMint,
  createMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token"

import { SystemProgram } from "@solana/web3.js";
import { createInitializeMintInstruction } from "@solana/spl-token";

interface TokenAccount {
  pubkey: PublicKey
  account: {
    mint: PublicKey
    owner: PublicKey
    amount: bigint
  }
}

export function CreateToken() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [decimals, setDecimals] = useState("9")
  const [initialSupply, setInitialSupply] = useState("1000000")
  const [loading, setLoading] = useState(false)
  const [mintAddress, setMintAddress] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey || !signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a token.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Generate a new mint keypair
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey;

      // Calculate the lamports required for rent exemption for a mint account
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      // Create the mint account instruction
      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintPublicKey,
        lamports,
        space: 82, // Mint account size for SPL tokens
        programId: TOKEN_PROGRAM_ID,
      });

      // Initialize the mint account instruction
      const initMintIx = createInitializeMintInstruction(
        mintPublicKey,
        Number.parseInt(decimals),
        publicKey, // mint authority
        publicKey  // freeze authority (or null to disable)
      );

      // Get the associated token account for the connected wallet and new mint
      const associatedTokenAddress = await getAssociatedTokenAddress(mintPublicKey, publicKey);

      // Create the associated token account instruction
      const createATAIx = createAssociatedTokenAccountInstruction(
        publicKey,
        associatedTokenAddress,
        publicKey,
        mintPublicKey
      );

      const instructions = [createAccountIx, initMintIx, createATAIx];

      // If an initial supply is specified, add a mintTo instruction
      if (Number.parseInt(initialSupply) > 0) {
        const mintAmount =
          BigInt(Number.parseInt(initialSupply)) *
          (10n ** BigInt(Number.parseInt(decimals)));
        const mintToIx = createMintToInstruction(
          mintPublicKey,
          associatedTokenAddress,
          publicKey,
          Number(mintAmount)
        );
        instructions.push(mintToIx);
      }

      // Build the transaction
      const transaction = new Transaction().add(...instructions);
      transaction.feePayer = publicKey;
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;

      // Partially sign the transaction with the mint keypair (required for creating the mint account)
      transaction.partialSign(mintKeypair);

      // Have the wallet sign the transaction
      const signedTx = await signTransaction(transaction);

      // Send the signed transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      const mintStr = mintPublicKey.toString();
      setMintAddress(mintStr);

      toast({
        title: "Token created successfully!",
        description: `Your new token has been created with mint address: ${mintStr.slice(0, 10)}...`,
      });
    } catch (error) {
      console.error("Error creating token:", error);
      toast({
        title: "Error creating token",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <DynamicNavbar />
      <main className="flex-1 container mx-auto px-4 py-8 mt-10">
        <h1 className="text-3xl font-bold mb-6 mt-10">Create New Token</h1>

        <WalletStatus />

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create SPL Token</CardTitle>
              <CardDescription>Create your own SPL token on the Solana blockchain</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateToken}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Token Name</Label>
                  <Input
                    id="name"
                    placeholder="My Token"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symbol">Token Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="TKN"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    required
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decimals">Decimals</Label>
                  <Input
                    id="decimals"
                    type="number"
                    placeholder="9"
                    value={decimals}
                    onChange={(e) => setDecimals(e.target.value)}
                    required
                    min="0"
                    max="9"
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of decimal places (0-9). Standard is 9 for most tokens.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialSupply">Initial Supply</Label>
                  <Input
                    id="initialSupply"
                    type="number"
                    placeholder="1000000"
                    value={initialSupply}
                    onChange={(e) => setInitialSupply(e.target.value)}
                    required
                    min="0"
                  />
                  <p className="text-sm text-muted-foreground">The initial amount of tokens to mint.</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setName("")
                    setSymbol("")
                    setDecimals("9")
                    setInitialSupply("1000000")
                  }}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={loading || !publicKey}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Token...
                    </>
                  ) : (
                    "Create Token"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {mintAddress && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Token Created Successfully!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">Your token has been created with the following details:</p>
                <div className="p-4 bg-muted rounded-md">
                  <p className="mb-2">
                    <span className="font-semibold">Name:</span> {name}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Symbol:</span> {symbol}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Decimals:</span> {decimals}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Initial Supply:</span> {initialSupply}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Mint Address:</span>{" "}
                    <code className="bg-background p-1 rounded">{mintAddress}</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default CreateToken
