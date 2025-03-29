import type { Metadata } from "next";
import SendTokenClient from "@/components/send-token-client";

export const metadata: Metadata = {
  title: "Solana Token App - Send SPL Token",
  description: "Send SPL tokens to another Solana address",
};

export default function SendPage() {
  return <SendTokenClient />;
}
