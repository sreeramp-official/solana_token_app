"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function WalletStatus() {
  const { publicKey, connected, connecting, disconnecting } = useWallet();

  if (connecting) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Connecting wallet</AlertTitle>
        <AlertDescription>
          Please approve the connection request in your wallet.
        </AlertDescription>
      </Alert>
    );
  }

  if (disconnecting) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Disconnecting wallet</AlertTitle>
        <AlertDescription>
          Your wallet is being disconnected.
        </AlertDescription>
      </Alert>
    );
  }

  if (!connected || !publicKey) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Wallet not connected</AlertTitle>
        <AlertDescription className="flex flex-col items-center gap-2">
          <span>Connect your Solana wallet to use this application.</span>
          <span className="text-xs text-gray-300">
            Note: This app uses the Solana Devnet. Make sure your wallet is configured for Devnet.
          </span>
          <div className="w-full md:w-auto">
            <WalletMultiButton />
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-6 border-green-500 dark:border-green-700">
      <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
      <AlertTitle>Wallet connected</AlertTitle>
      <AlertDescription>
        Connected to: {publicKey.toString().slice(0, 6)}...
        {publicKey.toString().slice(-6)}
      </AlertDescription>
    </Alert>
  );
}

export default WalletStatus;
