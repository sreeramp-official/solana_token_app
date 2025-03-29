"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NavLink from "@/components/navlink";
import ModeToggle from "@/components/mode-toggle";
import { Menu, X } from "lucide-react";

export function DynamicNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`w-full fixed top-0 left-0 z-10 transition-all border-b ${isScrolled ? "shadow-md" : ""
                }`}
            // Use CSS variable for background so that it updates when theme changes
            style={{ background: "hsl(var(--background))" }}
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Left: App Title */}
                <div className="flex-1">
                    <Link href="/">
                        <span className="text-xl font-bold cursor-pointer">
                            Solana Token App
                        </span>
                    </Link>
                </div>
                {/* Center: Desktop Navigation */}
                <div className="hidden md:flex flex-1 justify-center gap-6">
                    <NavLink href="/">Home</NavLink>
                    <NavLink href="/create">Create</NavLink>
                    <NavLink href="/mint">Mint</NavLink>
                    <NavLink href="/send">Send</NavLink>
                    <NavLink href="/history">History</NavLink>
                </div>
                {/* Right: Desktop Wallet Button and Theme Toggle */}
                <div className="hidden md:flex flex-1 justify-end items-center gap-4">
                    <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700" />
                    <ModeToggle />
                </div>
                {/* Mobile: Hamburger Menu */}
                <div className="md:hidden">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="focus:outline-none"
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
            {/* Mobile Menu */}
            {menuOpen && (
                <div
                    // Also use the CSS variable for mobile menu background
                    style={{ background: "hsl(var(--background))" }}
                    className="md:hidden px-6 py-4"
                >
                    <div className="flex flex-col space-y-4">
                        <NavLink href="/" onClick={() => setMenuOpen(false)}>
                            Home
                        </NavLink>
                        <NavLink href="/create" onClick={() => setMenuOpen(false)}>
                            Create
                        </NavLink>
                        <NavLink href="/mint" onClick={() => setMenuOpen(false)}>
                            Mint
                        </NavLink>
                        <NavLink href="/send" onClick={() => setMenuOpen(false)}>
                            Send
                        </NavLink>
                        <NavLink href="/history" onClick={() => setMenuOpen(false)}>
                            History
                        </NavLink>
                        <div className="flex flex-col gap-2">
                            <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700" />
                            <ModeToggle />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default DynamicNavbar;
