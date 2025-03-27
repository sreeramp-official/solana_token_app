import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function formatBalance(amount: bigint, decimals: number): string {
  const divisor = BigInt(10) ** BigInt(decimals)
  const integerPart = amount / divisor
  const fractionalPart = amount % divisor

  let fractionalStr = fractionalPart.toString().padStart(decimals, "0")
  // Trim trailing zeros
  fractionalStr = fractionalStr.replace(/0+$/, "")

  if (fractionalStr.length > 0) {
    return `${integerPart}.${fractionalStr}`
  }

  return integerPart.toString()
}

