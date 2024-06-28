'use client';

import React, { useState } from 'react';
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';
import { useActiveAccount } from "thirdweb/react";

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

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
      if (!window.ethereum) {
        throw new Error("No Ethereum wallet found. Please install MetaMask or another Web3 wallet.");
      }

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
          expirationTime: BigInt(0),
          revocable: true,
          data: encodedData,
        },
      });

      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);
      
      // Assuming the UID is part of the transaction hash or logs
      // You may need to adjust this based on the actual structure of the receipt
      const attestationUID = receipt.transactionHash;
      setLastAttestation(attestationUID);
      
      onMove(index, player);
    } catch (error) {
      console.error("Error creating attestation:", error);
      alert(`Failed to create attestation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAttesting(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Game Attestations</h3>
      {isAttesting && <p className="text-yellow-400">Creating attestation...</p>}
      {lastAttestation && <p className="text-green-400">Last attestation transaction hash: {lastAttestation}</p>}
      <button 
        className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        onClick={() => createAttestation(0, 'X')}
        disabled={isAttesting}
      >
        Create Test Attestation
      </button>
    </div>
  );
};

export default GameAttestations;
