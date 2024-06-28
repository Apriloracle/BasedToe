'use client';

import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';
import React, { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from "thirdweb/react";

interface GameAttestationsProps {
  setCreateAttestation: React.Dispatch<React.SetStateAction<((index: number, player: 'X' | 'O') => Promise<void>) | null>>;
}

const GameAttestations: React.FC<GameAttestationsProps> = ({ setCreateAttestation }) => {
    const [attestation, setAttestation] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAttesting, setIsAttesting] = useState<boolean>(false);

    const activeAccount = useActiveAccount();
    const currentAddress = activeAccount?.address || '0x0000000000000000000000000000000000000000';

    // Get environment variables
    const privateKey = process.env.NEXT_PUBLIC_TEMPLATE_PRIVATE_KEY;
    const rpcUrl_base = process.env.NEXT_PUBLIC_RPC_URL;
    const EASContractAddress = process.env.NEXT_PUBLIC_EASContractAddress_Base;
    const schemaUID = process.env.NEXT_PUBLIC_schemaUID;

    if (!privateKey || !rpcUrl_base || !EASContractAddress || !schemaUID) {
        throw new Error('One or more required environment variables are not defined');
    }

    // Initialize EAS and provider
    const eas = new EAS(EASContractAddress);
    const provider = new ethers.JsonRpcProvider(rpcUrl_base);
    const wallet = new ethers.Wallet(privateKey, provider);
    eas.connect(wallet);

    const createAttestation = useCallback(async (index: number, player: 'X' | 'O') => {
        setIsAttesting(true);
        setError(null);
        try {
            const schemaEncoder = new SchemaEncoder("uint256 moveIndex, string player, address player_address");
            const encodedData = schemaEncoder.encodeData([
                { name: "moveIndex", value: index, type: "uint256" },
                { name: "player", value: player, type: "string" },
                { name: "player_address", value: currentAddress, type: "address" },
            ]);

            const tx = await eas.attest({
                schema: schemaUID,
                data: {
                    recipient: currentAddress,
                    expirationTime: BigInt(0),
                    revocable: true,
                    data: encodedData,
                },
            });

            const newAttestation = await tx.wait();
            console.log("New attestation:", newAttestation);
            setAttestation(newAttestation);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsAttesting(false);
        }
    }, [eas, schemaUID, currentAddress]);

    useEffect(() => {
        setCreateAttestation(() => createAttestation);
    }, [createAttestation, setCreateAttestation]);

    return (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Game Attestations</h3>
            {isAttesting && <p className="text-yellow-400">Creating attestation...</p>}
            {attestation && <p className="text-green-400">Attestation created: {attestation.uid}</p>}
            {error && <p className="text-red-400">Error: {error}</p>}
        </div>
    );
};

export default GameAttestations;
