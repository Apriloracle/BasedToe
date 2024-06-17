'use client'
import { useActiveAccount, useActiveWallet, useActiveWalletChain } from "thirdweb/react";
import { client } from '@/app/client';
import React from 'react'

const WalletFuncs = () => {

  // get wallet address
  const activeAccount = useActiveAccount();
  // console.log("wallet address", activeAccount);

  // get balance
  const wallet = useActiveWallet();
  // console.log(wallet)

  return (
    <div>
      {wallet ? (
        <>
          <div>Connected Wallet Address: {activeAccount?.address}</div>
          {/* <div>Wallet Connected {wallet.id}</div> */}
        </>
      ) : (
        <div>No wallet connected</div>
      )}
    </div>
  )
}

export default WalletFuncs
