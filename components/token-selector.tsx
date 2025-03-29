"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

interface TokenAccount {
    pubkey: PublicKey;
    account: {
        mint: PublicKey;
        owner: PublicKey;
        amount: bigint;
    };
}

interface TokenSelectorProps {
    onTokenSelect: (mint: string) => void;
}

export function TokenSelector({ onTokenSelect }: TokenSelectorProps) {
    const { connection } = useConnection();
    const { publicKey, connected } = useWallet();
    const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([]);
    const [selected, setSelected] = useState("");

    useEffect(() => {
        const fetchTokenAccounts = async () => {
            if (!publicKey || !connected) return;
            try {
                const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                    programId: TOKEN_PROGRAM_ID,
                });
                const tokens = accounts.value.map((account) => ({
                    pubkey: account.pubkey,
                    account: {
                        mint: new PublicKey(account.account.data.parsed.info.mint),
                        owner: new PublicKey(account.account.data.parsed.info.owner),
                        amount: BigInt(account.account.data.parsed.info.tokenAmount.amount),
                    },
                }));
                setTokenAccounts(tokens);
                // Set first token as default only if no selection is made
                if (tokens.length > 0 && !selected) {
                    const defaultMint = tokens[0].account.mint.toString();
                    setSelected(defaultMint);
                    onTokenSelect(defaultMint);
                }
            } catch (error) {
                console.error("Error fetching token accounts:", error);
            }
        };

        fetchTokenAccounts();
    }, [publicKey, connected, connection, onTokenSelect, selected]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelected(value);
        onTokenSelect(value);
    };

    return (
        <select
            value={selected}
            onChange={handleChange}
            className="bg-background text-white border border-input rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors m-2"
        >
            {tokenAccounts.length > 0 ? (
                tokenAccounts.map((account) => (
                    <option key={account.pubkey.toString()} value={account.account.mint.toString()}>
                        {account.account.mint.toString()}
                    </option>
                ))
            ) : (
                <option value="">No tokens found</option>
            )}
        </select>
    );
}

export default TokenSelector;
