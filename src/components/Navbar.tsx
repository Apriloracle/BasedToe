'use client'
import { client } from '@/app/client';
import React from 'react'
import { defineChain } from 'thirdweb';
import { baseSepolia } from 'thirdweb/chains';
import { ConnectButton } from "thirdweb/react";
import { createWallet } from 'thirdweb/wallets';

const Navbar = () => {
    const wallets = [
        createWallet('com.coinbase.wallet'),
    ]
    return (
        <div className='flex w-full h-[12vh] bg-zinc-800'>
            <div className='flex mx-10 w-full justify-between items-center'>
                <h3 className=''>LOGO...</h3>
                <div className="flex justify-center">
                    <ConnectButton
                        client={client}
                        wallets={wallets}
                        chain={defineChain(baseSepolia)}
                        connectButton={{
                            label: "Connect with Coinbase"
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default Navbar
