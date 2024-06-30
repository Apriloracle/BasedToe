'use client';
import React, { useState, useCallback } from 'react';
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import GameAttestations from './GameAttestations';
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(27).fill(null));
    const [winner, setWinner] = useState<string | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isWaiting, setIsWaiting] = useState(false);

    const activeAccount = useActiveAccount();
    const chain = useActiveWalletChain();
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

    const chain_: string = chain?.id.toString() || '8453';

    const calculateWinner = (squares: Array<string | null>) => {
        const lines = [
            // Horizontal lines (9)
            [0,1,2], [3,4,5], [6,7,8],
            [9,10,11], [12,13,14], [15,16,17],
            [18,19,20], [21,22,23], [24,25,26],

            // Vertical lines (9)
            [0,3,6], [1,4,7], [2,5,8],
            [9,12,15], [10,13,16], [11,14,17],
            [18,21,24], [19,22,25], [20,23,26],

            // Depth lines (9)
            [0,9,18], [1,10,19], [2,11,20],
            [3,12,21], [4,13,22], [5,14,23],
            [6,15,24], [7,16,25], [8,17,26],

            // Diagonals (10)
            [0,4,8], [2,4,6], [18,22,26], [20,22,24],
            [0,13,26], [2,13,24], [6,13,20], [8,13,18],
            [0,12,24], [2,14,26]
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const createAttestation = async (index: number, player: 'X' | 'O') => {
        try {
            setIsWaiting(true);
            const schemaEncoder = new SchemaEncoder("uint256 moveIndex, string player, address player_address, string timestamp, string chainid");
            const nowTime: string = new Date().toISOString();
            const encodedData = schemaEncoder.encodeData([
                { name: "moveIndex", value: index, type: "uint256" },
                { name: "player", value: player, type: "string" },
                { name: "player_address", value: currentAddress, type: "address" },
                { name: "timestamp", value: nowTime, type: "string" },
                { name: "chainid", value: chain_, type: "string" },
            ]);

            console.log("Attestation data:", {
                schema: schemaUID,
                data: {
                    recipient: currentAddress,
                    expirationTime: BigInt(0),
                    revocable: true,
                    data: encodedData,
                },
            });

            const tx = await eas.attest({
                schema: schemaUID,
                data: {
                    recipient: currentAddress,
                    expirationTime: BigInt(0),
                    revocable: true,
                    data: encodedData,
                },
            });

            console.log("Transaction sent:", tx);

            const receipt = await tx.wait();
            console.log("Attestation created:", receipt);
            setError(null);
        } catch (err: any) {
            console.error("Error creating attestation:", err);
            setError(err.message);
        } finally {
            setIsWaiting(false);
        }
    };

    const computerMove = (currentBoard: Array<string | null>) => {
        const availableMoves = currentBoard.reduce((acc: number[], cell, index) => 
            cell === null ? [...acc, index] : acc, []);
        
        if (availableMoves.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    };

    const handleClick = useCallback(async (i: number) => {
        if (winner || board[i] || gameOver || !currentAddress) return;

        const newBoard = [...board];
        newBoard[i] = 'X';
        setBoard(newBoard);
        await createAttestation(i, 'X');

        const playerWinner = calculateWinner(newBoard);
        if (playerWinner) {
            setWinner(playerWinner);
            setGameOver(true);
            return;
        } else if (newBoard.every((square) => square !== null)) {
            setGameOver(true);
            return;
        }

        // Computer's turn
        const computerMoveIndex = computerMove(newBoard);
        if (computerMoveIndex !== null) {
            newBoard[computerMoveIndex] = 'O';
            setBoard(newBoard);
            await createAttestation(computerMoveIndex, 'O');

            const computerWinner = calculateWinner(newBoard);
            if (computerWinner) {
                setWinner(computerWinner);
                setGameOver(true);
            } else if (newBoard.every((square) => square !== null)) {
                setGameOver(true);
            }
        }
    }, [board, winner, gameOver, currentAddress]);

    const resetGame = () => {
        setBoard(Array(27).fill(null));
        setWinner(null);
        setGameOver(false);
        setError(null);
    };

    if (!activeAccount) {
        return <div className="flex justify-center items-center h-screen"></div>;
    }

    const renderGrid = () => {
        return (
            <div className="grid grid-cols-1 gap-8">
                {[0, 1, 2].map((level) => (
                    <div key={level} className="grid grid-cols-3 gap-2">
                        {[0, 1, 2].map((row) => (
                            <div key={row} className="grid grid-cols-3 gap-2">
                                {[0, 1, 2].map((col) => {
                                    const index = level * 9 + row * 3 + col;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleClick(index)}
                                            className="w-16 h-16 text-2xl font-bold bg-white hover:bg-gray-100 border border-gray-300"
                                            disabled={board[index] !== null || gameOver || isWaiting}
                                        >
                                            {board[index]}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Tic Tac Toe + Attestation</h1>
                <p className="mb-4">Connected Address: {currentAddress}</p>
                
                {renderGrid()}
                
                <div className="mb-4 mt-4">
                    <p>
                        {winner ? `Winner: ${winner}` : gameOver ? "Draw!" : "Your turn (X)"}
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

                {isWaiting && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <p className="text-lg font-semibold mb-4 text-black">Processing move...</p>
                            <div className="loader"></div>
                        </div>
                    </div>
                )}

                <GameAttestations onCreateAttestation={createAttestation} />
            </div>
        </div>
    );
};

export default TicTacToe;
