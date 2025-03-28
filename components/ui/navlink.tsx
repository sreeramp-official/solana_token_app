"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href} className="group relative">
            <span className="text-lg font-medium text-white transition-colors">
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
