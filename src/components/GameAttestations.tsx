'use client';

import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';
import React, { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from "thirdweb/react";

interface GameAttestationsProps {
  onCreateAttestation: (index: number, player: 'X' | 'O') => Promise<void>;
}

const GameAttestations: React.FC<GameAttestationsProps> = ({ onCreateAttestation }) => {
    const [attestation, setAttestation] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAttesting, setIsAttesting] = useState<boolean>(false);

    const activeAccount = useActiveAccount();
    const currentAddress = activeAccount?.address || '0x0000000000000000000000000000000000000000';

    // This effect is now just for logging purposes
    useEffect(() => {
        console.log("Current address:", currentAddress);
    }, [currentAddress]);

    return (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-white">Game Attestations</h3>
            {isAttesting && <p className="text-yellow-400">Creating attestation...</p>}
            {attestation && <p className="text-green-400">Attestation created: {attestation.uid || JSON.stringify(attestation)}</p>}
            {error && (
                <div className="text-red-400">
                    <p>Error: {error}</p>
                    <p>Please check the console for more details.</p>
                </div>
            )}
        </div>
    );
};

export default GameAttestations;
