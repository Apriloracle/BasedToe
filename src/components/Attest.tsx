'use client';
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { useActiveAccount, useActiveWalletChain, useConnect } from "thirdweb/react";

const Attest = () => {
    const [attestation, setAttestation] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [tx, setTx] = useState<any>(null); // State to hold transaction information
    const [receipt_, setReceipt_] = useState<any>(null); // State to hold transaction information
    const [isWaiting, setIsWaiting] = useState<boolean>(false); // State to manage waiting modal
    const [uid, setUid] = useState<string>(""); // State to hold the UID input value

    const chain = useActiveWalletChain()
    console.log("chainId", chain)

    // Get Private Key
    const privateKey = process.env.NEXT_PUBLIC_TEMPLATE_PRIVATE_KEY;
    const rpcUrl_base = process.env.NEXT_PUBLIC_RPC_URL
    const EASContractAddress = process.env.NEXT_PUBLIC_EASContractAddress_Base;
    const schemaUID = process.env.NEXT_PUBLIC_schemaUID

    if (!privateKey) {
        throw new Error('PRIVATE_KEY is not defined in the environment variables');
    }
    if (!rpcUrl_base) {
        throw new Error('RPC_URL is not defined in the environment variables');
    }
    if (!EASContractAddress) {
        throw new Error('EAS ContractAddress on Base is not defined in the environment variables');
    }
    if (!schemaUID) {
        throw new Error('Schema UID is not defined in the environment variables');
    }

    // if (!chain_) {
    //     throw new Error('Chain ID not defined');
    // }


    // Initialize EAS and provider
    // const EASContractAddress = ; 
    const eas = new EAS(EASContractAddress);
    const provider = new ethers.JsonRpcProvider(rpcUrl_base);
    const wallet = new ethers.Wallet(privateKey, provider);
    eas.connect(wallet);

    console.log(eas)


    // get wallet address
    const activeAccount = useActiveAccount();
    console.log("wallet address", activeAccount?.address);
    const currentAddress = activeAccount?.address || '0x0000000000000000000000000000000000000000';

    const chain_: string = chain?.id.toString() || '8453'

    const nowTime: string = new Date().toISOString();
    console.log(nowTime)
    // if (!currentAddress) {
    //     throw new Error('currentAddress is not defined in the environment variables');
    // }

    // Encode data using SchemaEncoder
    // Initialize SchemaEncoder with the schema string


    const schemaEncoder = new SchemaEncoder("string Source,address user_id,string timestamp,string transactionhash,string chainid");
    const encodedData = schemaEncoder.encodeData([
        { name: "Source", value: "", type: "string" },
        { name: "user_id", value: currentAddress, type: "address" },
        { name: "timestamp", value: nowTime, type: "string" },
        { name: "transactionhash", value: "", type: "string" },
        { name: "chainid", value: chain_, type: "string" },
    ]);


    // Function to fetch attestation
    const gettingAttestation = async () => {
        try {
            setIsWaiting(true); // Show waiting modal
            const attestation = await eas.getAttestation(uid);
            console.log(attestation);
            setAttestation(attestation);
            setError(null); // Clear any previous errors
            setTx(null); // Clear transaction state
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            setAttestation(null); // Clear any previous attestation
            setTx(null); // Clear transaction state
        } finally {
            setIsWaiting(false); // Hide waiting modal
        }
    };

    // Function to create attestation
    const creatingAttestation = async () => {
        try {
            setIsWaiting(true); // Show waiting modal
            const tx = await eas.attest({
                schema: schemaUID,
                data: {
                    recipient: currentAddress,
                    expirationTime: BigInt(0),
                    revocable: true, // Be aware that if your schema is not revocable, this MUST be false
                    data: encodedData,
                },
            });

            // Set transaction information after successful transaction
            setTx(tx);
            const receipt = await tx.wait(); // Wait for transaction to be mined
            setReceipt_(receipt);
            console.log("Transaction receipt:", receipt);
            setError(null); // Clear any previous errors
            setAttestation(null); // Clear attestation state
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            setTx(null); // Clear transaction state
            setAttestation(null); // Clear attestation state
        } finally {
            setIsWaiting(false); // Hide waiting modal
        }
    };

    return (
        <div>
            
        </div>
    );
};

export default Attest;
