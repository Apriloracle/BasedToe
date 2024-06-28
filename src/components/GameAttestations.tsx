'use client';

import React, { useState } from 'react';
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';
import { useActiveAccount } from "thirdweb/react";

interface GameAttestationsProps {
  onMove: (index: number, player: 'X' | 'O') => void;
}

const GameAttestations: React.FC<GameAttestationsProps> = ({ onMove }) => {
  const [isAttesting, setIsAttesting] = useState(false);
  const [lastAttestation, setLastAttestation] = useState<string | null>(null);
  
  const activeAccount = useActiveAccount();
  const currentAddress = activeAccount?.address || '0x0000000000000000000000000000000000000000';

  const EASContractAddress = process.env.NEXT_PUBLIC_EASContractAddress_Base;
  const schemaUID = process.env.NEXT_PUBLIC_schemaUID;

  if (!EASContractAddress || !schemaUID) {
    throw new Error('EAS Contract Address or Schema UID is not defined in environment variables');
  }

  const createAttestation = async (index: number, player: 'X' | 'O') => {
    setIsAttesting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const eas = new EAS(EASContractAddress);
      eas.connect(signer);

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
          expirationTime: 0,
          revocable: true,
          data: encodedData,
        },
      });

      const newAttestation = await tx.wait();
      setLastAttestation(newAttestation.uid);
      onMove(index, player);
    } catch (error) {
      console.error("Error creating attestation:", error);
    } finally {
      setIsAttesting(false);
    }
  };

  return (
    <div>
      <h3>Game Attestations</h3>
      {isAttesting && <p>Creating attestation...</p>}
      {lastAttestation && <p>Last attestation UID: {lastAttestation}</p>}
    </div>
  );
};

export default GameAttestations;
