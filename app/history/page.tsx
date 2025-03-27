import type { Metadata } from "next"
import dynamic from "next/dynamic"

// Import the TransactionHistory component with SSR disabled
const TransactionHistory = dynamic(
  () => import("@/components/transaction-history").then((mod) => mod.TransactionHistory),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex flex-col">
        <div className="h-14 border-b"></div>
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Transaction History</h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse">Loading wallet interface...</div>
          </div>
        </main>
      </div>
    ),
  }
)

export const metadata: Metadata = {
  title: "Transaction History",
  description: "View your Solana transaction history",
}

export default function HistoryPage() {
  return <TransactionHistory />
}

