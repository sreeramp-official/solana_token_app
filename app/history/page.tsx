import type { Metadata } from "next";
import TransactionHistoryClient from "@/components/transaction-history";

export const metadata: Metadata = {
  title: "Transaction History",
  description: "View your Solana transaction history",
};

export default function HistoryPage() {
  return <TransactionHistoryClient />;
}
