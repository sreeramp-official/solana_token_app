import type { Metadata } from "next";
import CreateTokenClient from "@/components/create-token-client";

export const metadata: Metadata = {
  title: "Create SPL Token",
  description: "Create a new SPL token on Solana blockchain",
};

export default function CreatePage() {
  return <CreateTokenClient />;
}
