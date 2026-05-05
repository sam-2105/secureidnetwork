import React from 'react';
import { ShieldCheckIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="w-full flex flex-col items-center justify-center text-center mb-8 gap-4">
      <div className="flex items-center space-x-3">
        <ShieldCheckIcon className="h-8 w-8 text-indigo-400 animate-title-pop-in" style={{ animationDelay: '0.1s' }} />
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500 tracking-wider animate-title-pop-in">
          Secure ID Network
        </h1>
      </div>
      <p className="text-center text-slate-400 max-w-md animate-title-pop-in" style={{ animationDelay: '0.2s' }}>
        A decentralized identity simulation. Select your role to begin.
      </p>
    </header>
  );
};

export default Header;