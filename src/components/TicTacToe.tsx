'use client';

import React, { useState, useCallback } from 'react';
import GameAttestations from './GameAttestations';

type Square = 'X' | 'O' | null;

const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<Square[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Square>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const calculateWinner = useCallback((squares: Square[]): Square => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }, []);

  const handleMove = useCallback((index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const newWinner = calculateWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      setIsGameOver(true);
    } else if (newBoard.every(Boolean)) {
      setIsGameOver(true);
    } else {
      setXIsNext(!xIsNext);
    }
  }, [board, xIsNext, winner, calculateWinner]);

  const handleAttestationMove = useCallback((index: number, player: 'X' | 'O') => {
    handleMove(index);
  }, [handleMove]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setIsGameOver(false);
  }, []);

  const renderSquare = (index: number) => (
    <button 
      key={index} 
      className="w-16 h-16 border border-gray-400 text-2xl font-bold bg-gray-800 hover:bg-gray-700 transition-colors"
      onClick={() => handleMove(index)}
      disabled={!!board[index] || isGameOver}
    >
      {board[index]}
    </button>
  );

  const status = winner
    ? `Winner: ${winner}`
    : isGameOver
    ? 'Draw!'
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="flex flex-col items-center bg-gray-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Tic Tac Toe</h2>
      <div className="text-xl font-bold mb-4 text-green-400">{status}</div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.map((_, index) => renderSquare(index))}
      </div>
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mb-4"
        onClick={resetGame}
      >
        Reset Game
      </button>
      <GameAttestations onMove={handleAttestationMove} />
    </div>
  );
};

export default TicTacToe;
