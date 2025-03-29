"use client";

import dynamic from "next/dynamic";

const MintToken = dynamic(
    () => import("@/components/mint-token").then((mod) => mod.MintToken),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex flex-col">
                <div className="h-14 border-b"></div>
                <main className="flex-1 container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-6">Mint Tokens</h1>
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-pulse">Loading wallet interface...</div>
                    </div>
                </main>
            </div>
        ),
    }
);

export default function MintTokenClient() {
    return <MintToken />;
}
