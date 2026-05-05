import React, { useState, useEffect } from 'react';
import { CubeIcon } from './Icons';
import { Web3State } from '../types';

interface Web3StatusProps {
  web3State: Web3State | null;
}

const Web3Status: React.FC<Web3StatusProps> = ({ web3State }) => {
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  useEffect(() => {
    if (web3State?.provider) {
      const { provider } = web3State;
      
      const getBlockNumber = async () => {
        try {
          const num = await provider.getBlockNumber();
          setBlockNumber(num);
        } catch (error) {
          console.error("Could not fetch block number:", error);
        }
      };
      
      getBlockNumber(); // Initial fetch

      const handleNewBlock = (num: number) => {
        setBlockNumber(num);
      };

      provider.on('block', handleNewBlock);

      return () => {
        provider.removeListener('block', handleNewBlock);
      };
    }
  }, [web3State]);

  if (!web3State) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-slate-800/80 backdrop-blur-sm text-xs text-slate-400 px-3 py-1.5 rounded-full border border-slate-700 animate-fade-in">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </div>
      <span className="capitalize">{web3State.network} Network</span>
      {blockNumber !== null && (
        <>
          <span className="text-slate-600">|</span>
          <CubeIcon className="h-3 w-3" />
          <span>{blockNumber}</span>
        </>
      )}
    </div>
  );
};

export default Web3Status;
