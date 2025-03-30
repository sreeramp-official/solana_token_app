"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createMintToInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getMint,
  getAccount,
} from "@solana/spl-token";
import { Loader2 } from "lucide-react";
import { DynamicNavbar } from "@/components/navbar";
import { WalletStatus } from "@/components/wallet-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import TokenSelector from "@/components/token-selector";

export function MintToken() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [selectedMint, setSelectedMint] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [mintInfo, setMintInfo] = useState<{
    decimals: number;
    mintAuthority: string | null;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const { toast } = useToast();

  // Reset mintInfo whenever a new token is selected
  const handleTokenSelect = (mint: string) => {
    setSelectedMint(mint);
    setMintInfo(null);
    setSuccessMessage("");
    setTxSignature("");
  };

  const handleVerifyMint = async () => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint tokens.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMint) {
      toast({
        title: "Missing token",
        description: "Please select a token from the dropdown.",
        variant: "destructive",
      });
      return;
    }

    try {
      setVerifying(true);

      let mintPublicKey: PublicKey;
      try {
        mintPublicKey = new PublicKey(selectedMint);
      } catch (error) {
        toast({
          title: "Invalid mint address",
          description: "The selected address is not a valid Solana address.",
          variant: "destructive",
        });
        return;
      }

      // Get the mint info from the chain
      const mintData = await getMint(connection, mintPublicKey);

      // Check if the connected wallet is the mint authority
      if (!mintData.mintAuthority || !mintData.mintAuthority.equals(publicKey)) {
        toast({
          title: "Not authorized",
          description: "Your wallet is not the mint authority for this token.",
          variant: "destructive",
        });
        return;
      }

      setMintInfo({
        decimals: mintData.decimals,
        mintAuthority: mintData.mintAuthority?.toString() || null,
      });

      toast({
        title: "Token verified",
        description: "You are authorized to mint this token.",
      });
    } catch (error) {
      console.error("Error verifying mint:", error);
      toast({
        title: "Error verifying token",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      setMintInfo(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleMintToken = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey || !mintInfo) {
      toast({
        title: "Cannot mint tokens",
        description: "Please verify the token selection first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const mintPublicKey = new PublicKey(selectedMint);

      // Calculate mint amount based on decimals
      const mintAmount = BigInt(Number.parseFloat(amount) * 10 ** mintInfo.decimals);

      // Get associated token account for the connected wallet
      const associatedTokenAddress = await getAssociatedTokenAddress(mintPublicKey, publicKey);

      const transaction = new Transaction();

      try {
        // Check if the associated token account exists
        await getAccount(connection, associatedTokenAddress);
      } catch (error) {
        // If not, add instruction to create it
        transaction.add(
          createAssociatedTokenAccountInstruction(publicKey, associatedTokenAddress, publicKey, mintPublicKey)
        );
      }

      // Add mint instruction
      transaction.add(
        createMintToInstruction(mintPublicKey, associatedTokenAddress, publicKey, Number(mintAmount))
      );

      // Sign and send transaction
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      // Build success message and explorer URL
      const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      const message = `${amount} tokens have been minted to your wallet.`;
      toast({
        title: "Tokens minted successfully!",
        description: message,
      });
      setSuccessMessage(message);
      setTxSignature(signature);

      // Reset the amount field
      setAmount("");
    } catch (error) {
      console.error("Error minting tokens:", error);
      toast({
        title: "Error minting tokens",
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
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mint Tokens</h1>
        <WalletStatus />
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Mint Additional Tokens</CardTitle>
              <CardDescription>
                Mint additional tokens to an existing SPL token mint
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Token Selection */}
              <div className="space-y-2">
                <Label htmlFor="tokenSelect">Select Token</Label>
                <TokenSelector onTokenSelect={handleTokenSelect} />
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
              {/* Verify Button */}
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={handleVerifyMint}
                  disabled={verifying || !selectedMint || !publicKey || !!mintInfo}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Token"
                  )}
                </Button>
              </div>
              {/* Mint Form */}
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
                    disabled={
                      loading ||
                      !mintInfo ||
                      !amount ||
                      Number.parseFloat(amount) <= 0 ||
                      !publicKey
                    }
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
              {successMessage && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
                  <p>{successMessage}</p>
                  {txSignature && (
                    <a
                      href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      View on Solana Explorer
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default MintToken;
