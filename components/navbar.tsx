"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function DynamicNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className="w-full fixed top-0 left-0 z-10 transition-all border"
            style={{ background: "hsl(222.2, 84%, 4.9%)" }}
        >
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/">
                    <span className="text-xl font-bold cursor-pointer">Solana Token App</span>
                </Link>
                <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700" />
            </div>
        </nav>
    );
}

export default DynamicNavbar;
