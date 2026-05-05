
import React from 'react';
import { CubeIcon } from './Icons';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 my-8">
      <div className="relative">
        <CubeIcon className="w-16 h-16 text-cyan-500 animate-spin" style={{ animationDuration: '3s' }}/>
      </div>
      <p className="text-slate-400 tracking-wider">Communicating with the Blockchain...</p>
    </div>
  );
};

export default Loader;
