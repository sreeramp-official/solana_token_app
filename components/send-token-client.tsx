"use client";

import dynamic from "next/dynamic";

const SendToken = dynamic(
    () => import("@/components/send-token").then((mod) => mod.SendToken),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex flex-col">
                <div className="h-14 border-b"></div>
                <main className="flex-1 container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-6">Send Tokens</h1>
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-pulse">Loading wallet interface...</div>
                    </div>
                </main>
            </div>
        ),
    }
);

export default function SendTokenClient() {
    return <SendToken />;
}
