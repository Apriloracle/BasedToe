'use client'
import { client } from '@/app/client';
import React from 'react'
import { defineChain } from 'thirdweb';
import { createAuth } from 'thirdweb/auth';
import { baseSepolia } from 'thirdweb/chains';
import { ConnectButton } from "thirdweb/react";
import { createWallet, walletConnect, inAppWallet } from 'thirdweb/wallets';

const Navbar = () => {
    const wallets = [
        createWallet('com.coinbase.wallet'),
    ]
    const wallets2 = [
        walletConnect(),
        createWallet('app.core.extension'),
        // createWallet('app.keeper-wallet'),
        // createWallet('app.herewallet'),
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
                            label: "Login"
                        }}
                    />
                </div>
                <div className="flex justify-center">
                    <ConnectButton
                        client={client}
                        wallets={wallets2}
                        
                    />
                </div>
            </div>
        </div>
    )
}

export default Navbar
