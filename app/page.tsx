import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard-client";

export const metadata: Metadata = {
  title: "Solana Token App - Dashboard",
  description: "Manage your SPL tokens on Solana blockchain",
};

export default function Home() {
  return <DashboardClient />;
}
