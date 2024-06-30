'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";

const TicTacToeWithAttestation = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);
    const [winner, setWinner] = useState<string | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isWaiting, setIsWaiting] = useState(false);
    const [tx, setTx] = useState<any>(null);
    const [receipt, setReceipt] = useState<any>(null);

    const chain = useActiveWalletChain();
    console.log("chainId", chain);

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

    // Get wallet address
    const activeAccount = useActiveAccount();
    console.log("wallet address", activeAccount?.address);
    const currentAddress = activeAccount?.address || '0x0000000000000000000000000000000000000000';

    const chain_: string = chain?.id.toString() || '8453';

    const schemaEncoder = new SchemaEncoder("uint256 moveIndex, string player, address player_address, string timestamp, string chainid");

    const calculateWinner = (squares: Array<string | null>) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const handleClick = useCallback(async (i: number) => {
        if (winner || board[i] || gameOver || !currentAddress) return;

        const newBoard = [...board];
        newBoard[i] = xIsNext ? 'X' : 'O';
        setBoard(newBoard);

        const nowWinner = calculateWinner(newBoard);
        if (nowWinner) {
            setWinner(nowWinner);
            setGameOver(true);
        } else if (newBoard.every((square) => square !== null)) {
            setGameOver(true);
        }

        try {
            setIsWaiting(true);
            const nowTime: string = new Date().toISOString();
            const encodedData = schemaEncoder.encodeData([
                { name: "moveIndex", value: i, type: "uint256" },
                { name: "player", value: xIsNext ? 'X' : 'O', type: "string" },
                { name: "player_address", value: currentAddress, type: "address" },
                { name: "timestamp", value: nowTime, type: "string" },
                { name: "chainid", value: chain_, type: "string" },
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

            setTx(tx);
            const receipt = await tx.wait();
            setReceipt(receipt);
            console.log("Transaction receipt:", receipt);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            setTx(null);
        } finally {
            setIsWaiting(false);
            setXIsNext(!xIsNext);
        }
    }, [board, winner, gameOver, xIsNext, currentAddress, chain_, eas, schemaEncoder, schemaUID]);

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setXIsNext(true);
        setWinner(null);
        setGameOver(false);
        setError(null);
        setTx(null);
        setReceipt(null);
    };

    if (!activeAccount) {
        return <div>Wallet Not connected</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Tic-Tac-Toe with Blockchain Attestation</h1>
            <p className="mb-4">Connected Address: {currentAddress}</p>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
                {board.map((square, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleClick(i)}
                        className="w-20 h-20 text-2xl font-bold bg-white hover:bg-gray-100 border border-gray-300"
                        disabled={square !== null || gameOver || isWaiting}
                    >
                        {square}
                    </button>
                ))}
            </div>
            
            <div className="mb-4">
                <p>
                    {winner ? `Winner: ${winner}` : gameOver ? "Draw!" : `Next player: ${xIsNext ? 'X' : 'O'}`}
                </p>
            </div>

            <button 
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={resetGame} 
                disabled={isWaiting}
            >
                Reset Game
            </button>

            {error && (
                <div className="mt-4 text-red-500">
                    <p>Error: {error}</p>
                </div>
            )}

            {tx && receipt && (
                <div className="mt-4">
                    <p>Transaction successful!</p>
                    <p>Transaction Hash: {tx.hash}</p>
                </div>
            )}

            {isWaiting && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <p className="text-lg font-semibold mb-4 text-black">Processing move...</p>
                        <div className="loader"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicTacToeWithAttestation;
