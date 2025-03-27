"use client";

import { useEffect, useState } from "react";

export const ClientOnlyProvider = ({ children }: { children: React.ReactNode }) => {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return null;

    return <>{children}</>;
};

export default ClientOnlyProvider;
