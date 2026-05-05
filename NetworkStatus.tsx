import React, { useState, useEffect } from 'react';
import { blockchainService } from '../services/blockchain';
import { storageService } from '../services/storageService';
import { CubeIcon, UserIcon, TrashIcon } from './Icons';

const NetworkStatus: React.FC = () => {
  const [status, setStatus] = useState({ totalNodes: 0, blockHeight: 0, identityCount: 0 });

  useEffect(() => {
    // This is a simple way to show status. In a real app with state changes,
    // the service would need to be an event emitter. For this simulation,
    // we can just poll it on an interval.
    const updateStatus = () => {
      setStatus(blockchainService.getNetworkStatus());
    };
    
    updateStatus(); // Initial fetch
    const intervalId = setInterval(updateStatus, 3000); // Update every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  const handleClearStorage = () => {
    if (window.confirm("Are you sure you want to clear all simulated network data? This action cannot be undone.")) {
      storageService.clearState();
      window.location.reload();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-slate-800/80 backdrop-blur-sm text-xs text-slate-400 pl-3 pr-1.5 py-1.5 rounded-full border border-slate-700 animate-fade-in">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </div>
      <span>Sim Network Online</span>
      <span className="text-slate-600">|</span>
      <span>Nodes: {status.totalNodes}</span>
       <span className="text-slate-600">|</span>
      <UserIcon className="h-3 w-3" />
      <span>{status.identityCount}</span>
      <span className="text-slate-600">|</span>
      <CubeIcon className="h-3 w-3" />
      <span>{status.blockHeight}</span>
      <span className="text-slate-600">|</span>
      <button onClick={handleClearStorage} className="p-1 rounded-full hover:bg-slate-700" aria-label="Clear simulation data">
          <TrashIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default NetworkStatus;