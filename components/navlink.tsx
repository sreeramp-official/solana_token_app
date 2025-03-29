"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { usePathname } from "next/navigation";

interface NavLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    children: React.ReactNode;
}

export function NavLink({ href, children, ...props }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href} {...props} className={`group relative ${props.className || ""}`}>
            <span className="font-medium text-base text-white hover:text-gray-300 transition-colors">
                {children}
            </span>
            <span
                className={`absolute left-0 -bottom-1 h-0.5 bg-indigo-600 transition-all duration-300 ease-out ${isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
            />
        </Link>
    );
}

export default NavLink;
