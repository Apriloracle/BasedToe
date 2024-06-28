'use client';

import React, { useState } from 'react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares) => {
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
  };

  const handleClick = (i) => {
    const newBoard = board.slice();
    if (calculateWinner(newBoard) || newBoard[i]) return;
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const renderSquare = (i) => (
    <button className="w-12 h-12 border border-gray-400 text-xl font-bold" onClick={() => handleClick(i)}>
      {board[i]}
    </button>
  );

  const winner = calculateWinner(board);
  const status = winner
    ? `Winner: ${winner}`
    : board.every(Boolean)
    ? 'Draw!'
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="flex flex-col items-center">
      <div className="text-xl font-bold mb-4">{status}</div>
      <div className="grid grid-cols-3 gap-1">
        {[...Array(9)].map((_, i) => renderSquare(i))}
      </div>
    </div>
  );
};

export default TicTacToe;
