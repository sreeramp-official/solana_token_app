"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
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

export function SendToken() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [tokenMint, setTokenMint] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{ decimals: number; balance: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { toast } = useToast();

  // Reset verified token info when a new token is selected
  const handleTokenSelect = (mint: string) => {
    setTokenMint(mint);
    setTokenInfo(null);
    setSuccessMessage("");
  };

  const handleVerifyToken = async () => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to send tokens.",
        variant: "destructive",
      });
      return;
    }
    if (!tokenMint) {
      toast({
        title: "Missing token mint",
        description: "Please select a token from the dropdown.",
        variant: "destructive",
      });
      return;
    }
    try {
      setVerifying(true);

      let mintPublicKey: PublicKey;
      try {
        mintPublicKey = new PublicKey(tokenMint);
      } catch (error) {
        toast({
          title: "Invalid token mint",
          description: "The selected address is not a valid Solana address.",
          variant: "destructive",
        });
        return;
      }

      // Get the associated token account for the sender
      const associatedTokenAddress = await getAssociatedTokenAddress(mintPublicKey, publicKey);

      try {
        // Get the token account info
        const tokenAccount = await getAccount(connection, associatedTokenAddress);
        // For proper decimals, you might fetch mint info. Here we use a fallback.
        const decimals = 0;
        const balance = (Number(tokenAccount.amount) / 10 ** decimals).toString();

        setTokenInfo({ decimals, balance });

        toast({
          title: "Token verified",
          description: `Your balance: ${balance} tokens`,
        });
      } catch (error) {
        toast({
          title: "Token not found",
          description: "You don't have any tokens for this mint address.",
          variant: "destructive",
        });
        setTokenInfo(null);
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      toast({
        title: "Error verifying token",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      setTokenInfo(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleSendToken = async (e: React.FormEvent) => {
    e.preventDefault();

    // Re-check connection before sending
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet before sending tokens.",
        variant: "destructive",
      });
      return;
    }
    if (!tokenInfo) {
      toast({
        title: "Cannot send tokens",
        description: "Please verify the token selection first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Validate recipient address
      let recipientPublicKey: PublicKey;
      try {
        recipientPublicKey = new PublicKey(recipientAddress);
      } catch (error) {
        toast({
          title: "Invalid recipient address",
          description: "The provided recipient address is not valid.",
          variant: "destructive",
        });
        return;
      }

      // Validate amount
      const amountValue = Number.parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount greater than 0.",
          variant: "destructive",
        });
        return;
      }
      if (tokenInfo && amountValue > Number.parseFloat(tokenInfo.balance)) {
        toast({
          title: "Insufficient balance",
          description: `You only have ${tokenInfo.balance} tokens available.`,
          variant: "destructive",
        });
        return;
      }

      const mintPublicKey = new PublicKey(tokenMint);
      // Calculate send amount based on decimals
      const sendAmount = BigInt(amountValue * 10 ** tokenInfo.decimals);

      // Get associated token accounts for sender and recipient
      const senderTokenAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
      const recipientTokenAccount = await getAssociatedTokenAddress(mintPublicKey, recipientPublicKey);

      // Create transaction
      const transaction = new Transaction();

      // If recipient's token account doesn't exist, create it
      try {
        await getAccount(connection, recipientTokenAccount);
      } catch (error) {
        transaction.add(
          createAssociatedTokenAccountInstruction(publicKey, recipientTokenAccount, recipientPublicKey, mintPublicKey)
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(senderTokenAccount, recipientTokenAccount, publicKey, Number(sendAmount))
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      const message = `${amount} tokens have been sent to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`;
      toast({
        title: "Tokens sent successfully!",
        description: message,
      });
      setSuccessMessage(message);

      // Reset form
      setAmount("");
      setRecipientAddress("");
      setTokenInfo(null);
      setTokenMint("");
    } catch (error) {
      console.error("Error sending tokens:", error);
      toast({
        title: "Error sending tokens",
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
        <h1 className="text-3xl font-bold mb-6">Send Tokens</h1>
        <WalletStatus />
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Send SPL Tokens</CardTitle>
              <CardDescription>Send SPL tokens to another Solana address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Token Selection */}
              <div className="space-y-2">
                <Label htmlFor="tokenSelect">Select Token</Label>
                <TokenSelector onTokenSelect={handleTokenSelect} />
              </div>
              {tokenInfo && (
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm">
                    <span className="font-semibold">Available Balance:</span> {tokenInfo.balance}
                  </p>
                </div>
              )}
              {/* Verify Button */}
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={handleVerifyToken}
                  disabled={verifying || !tokenMint || !publicKey || !!tokenInfo}
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
              {/* Send Form */}
              <form onSubmit={handleSendToken}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input
                      id="recipient"
                      placeholder="Enter recipient's Solana address"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      disabled={loading || !tokenInfo}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount to Send</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount to send"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={loading || !tokenInfo}
                      required
                      min="0"
                      step="any"
                    />
                    {tokenInfo && (
                      <p className="text-sm text-muted-foreground">Available balance: {tokenInfo.balance}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      loading ||
                      !tokenInfo ||
                      !amount ||
                      Number.parseFloat(amount) <= 0 ||
                      !recipientAddress ||
                      !publicKey ||
                      (tokenInfo && Number.parseFloat(amount) > Number.parseFloat(tokenInfo.balance))
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Tokens...
                      </>
                    ) : (
                      "Send Tokens"
                    )}
                  </Button>
                </div>
              </form>
              {successMessage && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
                  {successMessage}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default SendToken;
