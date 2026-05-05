import React, { useState, useRef, FormEvent } from 'react';
import { generateAvatar, issueCertificateOnChain } from '../services/geminiService';
import { uploadFileToIPFS } from '../services/ipfsService';
import { blockchainService } from '../services/blockchain';
import { Certificate, UserIdentity } from '../types';
import Loader from '../components/Loader';
import CertificateCard from '../components/CertificateCard';
import { UploadCloudIcon, UserIcon, LockIcon, KeyIcon, SearchIcon, ShieldCheckIcon } from '../components/Icons';
import InputField from '../components/InputField';

type Stage = 'LOGIN' | 'USER_SELECT' | 'CREATE_USER' | 'ISSUE_CERT';

const IssuerView: React.FC = () => {
  const [stage, setStage] = useState<Stage>('LOGIN');
  const [issuerName, setIssuerName] = useState('');
  const [currentUser, setCurrentUser] = useState<UserIdentity | null>(null);
  
  const [file, setFile] = useState<{ name: string; type: string; buffer: ArrayBuffer } | null>(null);
  const [issuedCertificates, setIssuedCertificates] = useState<Certificate[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  const issueFormRef = useRef<HTMLFormElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
       try {
        const buffer = await selectedFile.arrayBuffer();
        setFile({ name: selectedFile.name, type: selectedFile.type, buffer: buffer });
        setError('');
      } catch (err) {
        setError("Could not read the selected file.");
        setFile(null);
      }
    }
  };
  
  const handleIssueCertificate = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      if (!file || !currentUser) return;

      setIsLoading(true);
      setError('');
      
      try {
        setStatusMessage('Generating unique user avatar...');
        const avatarBase64 = await generateAvatar(currentUser.ownerName);

        setStatusMessage('Uploading document to IPFS...');
        const ipfsCid = await uploadFileToIPFS(file);
        if (!ipfsCid) throw new Error('Failed to upload document to IPFS.');
        
        setStatusMessage('Generating transaction on ledger...');
        const { transactionId, blockNumber } = await issueCertificateOnChain(issuerName, currentUser.ownerName, currentUser.username, ipfsCid);

        const newCert: Certificate = {
          id: crypto.randomUUID(),
          username: currentUser.username,
          ownerName: currentUser.ownerName,
          issuerName,
          fileName: file.name,
          ipfsCid,
          issueDate: new Date().toISOString(),
          transactionId,
          blockNumber,
          avatarBase64,
        };
        
        setStatusMessage('Broadcasting certificate to network...');
        await blockchainService.issueCertificate(newCert);

        setIssuedCertificates(prev => [newCert, ...prev]);
        setFile(null);
        form.reset();

      } catch (err: any) {
          console.error(err);
          const message = err.message || 'An unknown error occurred during issuance.';
          setError(message);
      } finally {
          setIsLoading(false);
          setStatusMessage('');
      }
  };

  const handleUserCreation = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const ownerName = formData.get('ownerName') as string;

    setIsLoading(true);
    setError('');
    
    const identity = await blockchainService.registerIdentity(username, password, ownerName);
    
    if (identity) {
      setCurrentUser(identity);
      setStage('ISSUE_CERT');
    } else {
      setError('Username already exists. Please choose another.');
    }
    setIsLoading(false);
  }

  const handleUserSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;

    setIsLoading(true);
    setError('');
    const identity = await blockchainService.findIdentityByUsername(username);

    if (identity) {
      setCurrentUser(identity);
      setStage('ISSUE_CERT');
    } else {
      setError('User not found. You can create a new identity for them.');
    }
    setIsLoading(false);
  }


  if (stage === 'LOGIN') {
    return (
        <div className="view-container">
            <h2 className="text-xl font-semibold text-center text-slate-300 mb-6">Issuer Login</h2>
            <form onSubmit={() => setStage('USER_SELECT')} className="space-y-4">
                <InputField icon={<UserIcon className="w-5 h-5 text-slate-500" />} type="text" value={issuerName} onChange={(e) => setIssuerName(e.target.value)} placeholder="Enter Your Name (Issuer)" required />
                <button type="submit" disabled={!issuerName} className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200">
                    Start Issuing
                </button>
            </form>
        </div>
    );
  }

  if (stage === 'USER_SELECT' || stage === 'CREATE_USER') {
    return (
        <div className="view-container">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-300">Issue For</h2>
              <p className="text-slate-500">Create or find a user identity.</p>
            </div>
            <button onClick={() => setStage('LOGIN')} className="text-sm text-slate-400 hover:text-white">Change Issuer</button>
          </div>
          
           <div className="flex p-1 bg-slate-800 rounded-lg mb-6">
              <button onClick={() => setStage('CREATE_USER')} className={`w-full py-2 rounded-md transition-colors text-sm font-medium ${stage === 'CREATE_USER' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>Create New User</button>
              <button onClick={() => setStage('USER_SELECT')} className={`w-full py-2 rounded-md transition-colors text-sm font-medium ${stage === 'USER_SELECT' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>Find Existing User</button>
            </div>
            
            {stage === 'CREATE_USER' && (
              <form onSubmit={handleUserCreation} className="space-y-4">
                <InputField name="ownerName" icon={<UserIcon className="w-5 h-5 text-slate-500" />} type="text" placeholder="Recipient's Full Name" disabled={isLoading} required />
                <InputField name="username" icon={<KeyIcon className="w-5 h-5 text-slate-500" />} type="text" placeholder="Create a username" disabled={isLoading} required />
                <InputField name="password" icon={<LockIcon className="w-5 h-5 text-slate-500" />} type="password" placeholder="Create a password" disabled={isLoading} required />
                <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200">
                    {isLoading ? 'Creating...' : 'Create & Continue'}
                </button>
              </form>
            )}

            {stage === 'USER_SELECT' && (
              <form onSubmit={handleUserSearch} className="space-y-4">
                 <InputField name="username" icon={<SearchIcon className="w-5 h-5 text-slate-500" />} type="text" placeholder="Enter username to find" disabled={isLoading} required />
                 <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200">
                    {isLoading ? 'Searching...' : 'Find & Continue'}
                </button>
              </form>
            )}
            {isLoading && <Loader />}
            {error && <p className="text-sm text-red-400 text-center mt-4">{error}</p>}
        </div>
    );
  }

  if (stage === 'ISSUE_CERT' && currentUser) {
    return (
      <div className="w-full space-y-8">
        <div className="view-container">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-300">Issue Certificate</h2>
              <p className="text-slate-500">For: <span className="font-semibold text-indigo-400">{currentUser.ownerName}</span> ({currentUser.username})</p>
            </div>
            <button onClick={() => { setCurrentUser(null); setStage('USER_SELECT'); }} className="text-sm text-slate-400 hover:text-white">Change User</button>
          </div>
          <form ref={issueFormRef} onSubmit={handleIssueCertificate} className="space-y-4">
              <div>
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 border-2 border-dashed border-slate-600 rounded-md font-semibold text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-all duration-200 flex flex-col items-center justify-center p-6 mt-2">
                      <UploadCloudIcon className="w-8 h-8 mb-2"/>
                      <span className="text-center">{file ? file.name : 'Select document to issue'}</span>
                  </label>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} disabled={isLoading} />
              </div>
               <button type="submit" disabled={!file || isLoading} className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40">
                  {isLoading ? statusMessage : 'Issue Certificate'}
              </button>
               {isLoading && <Loader />}
               {error && <p className="text-sm text-red-400 text-center mt-4">{error}</p>}
          </form>
        </div>
        
        {issuedCertificates.length > 0 && (
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-300 px-2 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                  Recently Issued for {currentUser.ownerName}
                </h3>
                {issuedCertificates.map(cert => <CertificateCard key={cert.id} certificate={cert} />)}
            </div>
        )}
      </div>
    );
  }

  return null;
};

export default IssuerView;