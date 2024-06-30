# Based Toe

This project is a unique implementation of the classic Tic-Tac-Toe game, featuring three vertical 3x3 grids and blockchain (EAS) attestations for each move. Players compete against a computer opponent, with each move being recorded on the blockchain using the Ethereum Attestation Service (EAS).

## Features

- Three vertical 3x3 Tic-Tac-Toe grids
- Play against a computer opponent
- Blockchain attestation for each move
- Built with Next.js and React
- Styled with Tailwind CSS
- Integrated with Thirdweb for wallet connection
- Uses Ethereum Attestation Service (EAS) for move verification

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm or yarn
- A modern web browser
- Coinbase Smart Wallet 
- You can also MetaMask or another Ethereum wallet

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/tic-tac-toe-blockchain.git
   ```

2. Navigate to the project directory:
   ```
   cd tic-tac-toe-blockchain
   ```

3. Install the dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

4. Create a `.env.local` file in the root directory and add the following environment variables:
   ```
   NEXT_PUBLIC_TEMPLATE_PRIVATE_KEY=your_private_key
   NEXT_PUBLIC_RPC_URL=your_rpc_url
   NEXT_PUBLIC_EASContractAddress_Base=your_eas_contract_address
   NEXT_PUBLIC_schemaUID=your_schema_uid
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
   ```

## Running the Application

To run the application in development mode:

```
npm run dev
```
or
```
yarn dev
```

Navigate to `http://localhost:3000` in your web browser to play the game.

## How to Play

1. Connect your wallet using the "Connect Wallet" button.
2. The game starts on the first (top) board. Click on an empty cell to make your move.
3. After your move, the game switches to the next board, and the computer makes its move.
4. Continue playing across all three boards.
5. Get three in a row on any single board to win the game.
6. Each move is recorded on the blockchain as an attestation.

## Technologies Used

- Next.js
- React
- Typescript
- Tailwind CSS
- Ethereum Attestation Service (EAS)
- Thirdweb
- ethers.js

## Contributing

Contributions to improve the game are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature-name`)
6. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Acknowledgments

- Ethereum Attestation Service for providing the attestation infrastructure
- Thirdweb for wallet integration capabilities
- The Next.js and React communities for their excellent documentation and support
