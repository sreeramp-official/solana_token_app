import type { Metadata } from "next";
import MintTokenClient from "@/components/mint-token-client";

export const metadata: Metadata = {
  title: "Solana Token App - Mint SPL Token",
  description: "Mint additional tokens to an existing SPL token",
};

export default function MintPage() {
  return <MintTokenClient />;
}
