"use client";

import dynamic from "next/dynamic";

// Dynamically import CreateToken with SSR disabled
const CreateToken = dynamic(
    () => import("@/components/create-token").then((mod) => mod.CreateToken),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex flex-col">
                <div className="h-14 border-b"></div>
                <main className="flex-1 container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-pulse">Loading wallet interface...</div>
                    </div>
                </main>
            </div>
        ),
    }
);

export default function CreateTokenClient() {
    return <CreateToken />;
}
