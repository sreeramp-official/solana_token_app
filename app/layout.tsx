import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ClientOnlyProvider from "@/components/client-only-provider";
import WalletProviderClient from "@/components/WalletProviderClient"; // new client wrapper
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Solana Token App",
  description: "Create, mint and send SPL tokens on Solana",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClientOnlyProvider>
            <WalletProviderClient>
              {children}
              <Toaster />
            </WalletProviderClient>
          </ClientOnlyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
