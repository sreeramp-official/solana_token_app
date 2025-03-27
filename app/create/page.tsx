import type { Metadata } from "next"
import dynamic from "next/dynamic"

// Import the CreateToken component with SSR disabled
const CreateToken = dynamic(() => import("@/components/create-token").then((mod) => mod.CreateToken), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex flex-col">
      <div className="h-14 border-b"></div>
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Token</h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse">Loading wallet interface...</div>
        </div>
      </main>
    </div>
  ),
})

export const metadata: Metadata = {
  title: "Create SPL Token",
  description: "Create a new SPL token on Solana blockchain",
}

export default function CreatePage() {
  return <CreateToken />
}

