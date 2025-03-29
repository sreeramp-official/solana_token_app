"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NavLink from "@/components/navlink";

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
            className={`w-full fixed top-0 left-0 z-10 transition-all border-b ${isScrolled ? "shadow-md" : ""
                }`}
            style={{ background: "hsl(222.2, 84%, 4.9%)" }}
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Left: App Title */}
                <div className="flex-1">
                    <Link href="/">
                        <span className="text-xl font-bold text-white cursor-pointer">
                            Solana Token App
                        </span>
                    </Link>
                </div>
                {/* Center: Navigation Links */}
                <div className="flex-1 flex justify-center space-x-6 gap-6">
                    <NavLink href="/create">Create Token</NavLink>
                    <NavLink href="/mint">Mint Token</NavLink>
                    <NavLink href="/send">Send Token</NavLink>
                </div>
                {/* Right: Wallet Button */}
                <div className="flex-1 flex justify-end">
                    <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700" />
                </div>
            </div>
        </nav>
    );
}

export default DynamicNavbar;
