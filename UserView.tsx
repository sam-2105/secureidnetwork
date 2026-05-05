import React, { useState } from 'react';
import { Certificate, UserIdentity } from '../types';
import CertificateCard from '../components/CertificateCard';
import { blockchainService } from '../services/blockchain';
import { LockIcon, FileBadgeIcon, KeyIcon, UserIcon } from '../components/Icons';
import InputField from '../components/InputField';

const UserView: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserIdentity | null>(null);
  const [foundCertificates, setFoundCertificates] = useState<Certificate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) return;
    
    setIsLoading(true);
    setError(null);
    
    const identity = await blockchainService.authenticateUser(username, password);
    
    if (identity) {
      const results = await blockchainService.findCertificatesByUsername(identity.username);
      setFoundCertificates(results);
      setCurrentUser(identity);
      setIsLoggedIn(true);
    } else {
      setError('Invalid username or password.');
    }
    setIsLoading(false);
  };
  
  const handleLogout = () => {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setFoundCertificates([]);
      setError(null);
  };

  if (isLoggedIn && currentUser) {
    return (
        <div className="w-full animate-fade-in">
             <div className="flex justify-between items-center mb-6 px-2">
                <div>
                    <h2 className="text-xl font-semibold text-slate-300">Welcome, {currentUser.ownerName}</h2>
                    <p className="text-slate-500">Your certificates are listed below.</p>
                </div>
                <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-slate-700 text-slate-300 text-sm font-semibold rounded-md hover:bg-slate-600 transition-colors"
                >
                    Log Out
                </button>
            </div>
            <div className="space-y-6">
              {foundCertificates.length > 0 ? (
                foundCertificates.map(cert => <CertificateCard key={cert.id} certificate={cert} />)
              ) : (
                <div className="text-center py-16 bg-slate-900 border-2 border-dashed border-slate-800 rounded-xl">
                    <FileBadgeIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-300">No Certificates Found</h3>
                    <p className="text-slate-500 text-sm">This account does not have any certificates yet.</p>
                </div>
              )}
            </div>
        </div>
    );
  }

  return (
    <div className="w-full view-container">
      <div className="flex flex-col items-center text-center mb-6">
        <LockIcon className="w-12 h-12 text-slate-600 mb-3" />
        <h2 className="text-xl font-semibold text-slate-300">Certificate Holder Login</h2>
        <p className="text-slate-500">Enter your credentials to access your digital certificates.</p>
      </div>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <InputField 
            name="username"
            icon={<UserIcon className="w-5 h-5 text-slate-500" />} 
            type="text" 
            placeholder="Username" 
            disabled={isLoading}
            required
        />
        <InputField 
            name="password"
            icon={<KeyIcon className="w-5 h-5 text-slate-500" />}
            type="password"
            placeholder="Password"
            disabled={isLoading}
            required
        />
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Authenticating...' : 'Log In & View Certificates'}
        </button>
      </form>
    </div>
  );
};

export default UserView;