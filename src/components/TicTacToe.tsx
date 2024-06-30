'use client';
import React, { useState, useCallback } from 'react';
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import GameAttestations from './GameAttestations';
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(64).fill(null));
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
            // Horizontal lines (16)
            [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15],
            [16,17,18,19], [20,21,22,23], [24,25,26,27], [28,29,30,31],
            [32,33,34,35], [36,37,38,39], [40,41,42,43], [44,45,46,47],
            [48,49,50,51], [52,53,54,55], [56,57,58,59], [60,61,62,63],

            // Vertical lines (16)
            [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15],
            [16,20,24,28], [17,21,25,29], [18,22,26,30], [19,23,27,31],
            [32,36,40,44], [33,37,41,45], [34,38,42,46], [35,39,43,47],
            [48,52,56,60], [49,53,57,61], [50,54,58,62], [51,55,59,63],

            // Depth lines (16)
            [0,16,32,48], [1,17,33,49], [2,18,34,50], [3,19,35,51],
            [4,20,36,52], [5,21,37,53], [6,22,38,54], [7,23,39,55],
            [8,24,40,56], [9,25,41,57], [10,26,42,58], [11,27,43,59],
            [12,28,44,60], [13,29,45,61], [14,30,46,62], [15,31,47,63],

            // Diagonals (18)
            [0,5,10,15], [3,6,9,12],
            [16,21,26,31], [19,22,25,28],
            [32,37,42,47], [35,38,41,44],
            [48,53,58,63], [51,54,57,60],
            [0,20,40,60], [3,23,43,63],
            [12,24,36,48], [15,27,39,51],
            [0,17,34,51], [3,18,33,48],
            [12,25,38,51], [15,26,37,48],
            [0,21,42,63], [3,22,41,60]
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c, d] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c] && squares[a] === squares[d]) {
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
        setBoard(Array(64).fill(null));
        setWinner(null);
        setGameOver(false);
        setError(null);
    };

    if (!activeAccount) {
        return <div className="flex justify-center items-center h-screen"></div>;
    }

    const renderCube = () => {
        return (
            <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((level) => (
                    <div key={level} className="grid grid-cols-4 gap-2 mb-4">
                        {[0, 1, 2, 3].map((row) => (
                            <div key={row} className="grid grid-cols-4 gap-2">
                                {[0, 1, 2, 3].map((col) => {
                                    const index = level * 16 + row * 4 + col;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleClick(index)}
                                            className="w-12 h-12 text-xl font-bold bg-white hover:bg-gray-100 border border-gray-300"
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
                <h1 className="text-3xl font-bold mb-4">Tic-Tac-Toe + Attestations</h1>
                <p className="mb-4">Connected Address: {currentAddress}</p>
                
                {renderCube()}
                
                <div className="mb-4">
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
