import React from 'react';
import { Web3State } from '../types';
import { WalletIcon, LogOutIcon } from './Icons';

interface WalletButtonProps {
  web3State: Web3State | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({ web3State, isConnecting, onConnect, onDisconnect }) => {
  if (web3State) {
    const { account } = web3State;
    const truncatedAccount = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;

    return (
      <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg p-2">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="text-sm font-mono text-slate-300">{truncatedAccount}</span>
        </div>
        <button onClick={onDisconnect} className="p-2 rounded-md hover:bg-slate-700 transition-colors" aria-label="Disconnect wallet">
          <LogOutIcon className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-wait transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
    >
      <WalletIcon className="w-5 h-5" />
      <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
    </button>
  );
};

export default WalletButton;
