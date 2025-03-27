"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

// Dynamically import the wallet provider with SSR disabled
const WalletContextProvider = dynamic(
    () =>
        import("@/components/wallet-provider").then(
            (mod) => mod.WalletContextProvider
        ),
    { ssr: false }
);

export default function WalletProviderClient({
    children,
}: {
    children: ReactNode;
}) {
    return <WalletContextProvider>{children}</WalletContextProvider>;
}
