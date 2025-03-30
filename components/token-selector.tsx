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
    const [manualMode, setManualMode] = useState(false);
    const [manualToken, setManualToken] = useState("");

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
                // Set first token as default only if not in manual mode and no selection exists
                if (tokens.length > 0 && !selected && !manualMode) {
                    const defaultMint = tokens[0].account.mint.toString();
                    setSelected(defaultMint);
                    onTokenSelect(defaultMint);
                }
            } catch (error) {
                console.error("Error fetching token accounts:", error);
            }
        };

        fetchTokenAccounts();
    }, [publicKey, connected, connection, onTokenSelect, selected, manualMode]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === "manual") {
            setManualMode(true);
            setSelected("");
            onTokenSelect(""); // Clear selection
        } else {
            setSelected(value);
            setManualMode(false);
            onTokenSelect(value);
        }
    };

    const handleManualConfirm = () => {
        try {
            // Validate manual token mint address
            const pKey = new PublicKey(manualToken);
            setSelected(pKey.toString());
            onTokenSelect(pKey.toString());
            setManualMode(false);
        } catch (error) {
            console.error("Invalid manual token mint address", error);
            // Optionally, display an error toast/message here.
        }
    };

    return (
        <div className="m-2">
            <select
                value={selected || (manualMode ? "manual" : "")}
                onChange={handleChange}
                className="w-full md:w-auto bg-background border border-input rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
            >
                {tokenAccounts.length > 0 &&
                    tokenAccounts.map((account) => (
                        <option key={account.pubkey.toString()} value={account.account.mint.toString()}>
                            {account.account.mint.toString()}
                        </option>
                    ))}
                <option value="manual">Add Manual Token</option>
            </select>
            {manualMode && (
                <div className="mt-2 flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter token mint address"
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value)}
                        className="w-full bg-background border border-input rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
                    />
                    <button
                        onClick={handleManualConfirm}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            )}
        </div>
    );
}

export default TokenSelector;
