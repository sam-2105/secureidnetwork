import React, { useState } from 'react';
import { VerificationStatus, VerificationResult as VerificationResultType, Certificate } from '../types';
import CertificateCard from '../components/CertificateCard';
import Loader from '../components/Loader';
import { CheckCircleIcon, XCircleIcon, UploadCloudIcon, FileBadgeIcon } from '../components/Icons';
import { generateVerificationNarrative, generateFailureNarrative } from '../services/geminiService';
import { calculateCidFromBuffer } from '../services/ipfsService';
import { blockchainService } from '../services/blockchain';
import InputField from '../components/InputField';

const VerifierView: React.FC = () => {
  const [mode, setMode] = useState<'id' | 'file'>('id');
  const [certificateId, setCertificateId] = useState('');
  const [file, setFile] = useState<{ name: string; buffer: ArrayBuffer } | null>(null);
  const [status, setStatus] = useState<VerificationStatus>(VerificationStatus.IDLE);
  const [result, setResult] = useState<VerificationResultType | null>(null);

  const resetState = () => {
    setStatus(VerificationStatus.IDLE);
    setResult(null);
  }

  const handleModeChange = (newMode: 'id' | 'file') => {
    setMode(newMode);
    setCertificateId('');
    setFile(null);
    resetState();
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      try {
        const buffer = await selectedFile.arrayBuffer();
        setFile({ name: selectedFile.name, buffer: buffer });
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Could not read the selected file.");
        setFile(null);
      }
    }
  };

  const handleVerificationSuccess = async (certificate: Certificate, consensus: { nodesFound: number; totalNodes: number }) => {
    const narrative = await generateVerificationNarrative(certificate, consensus);
    setResult({ status: 'VERIFIED', message: narrative, certificate, consensus });
    setStatus(VerificationStatus.VERIFIED);
  };

  const handleVerificationFailure = async (reason: string, consensus?: { nodesFound: number; totalNodes: number }) => {
    const narrative = await generateFailureNarrative(reason);
    setResult({ status: 'FAILED', message: narrative, consensus });
    setStatus(VerificationStatus.FAILED);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(VerificationStatus.PENDING);
    setResult(null);
    
    try {
        let verificationResult: VerificationResultType | null = null;

        if (mode === 'id') {
          verificationResult = await blockchainService.verifyCertificateById(certificateId.trim());
        } else if (file) {
          const cid = await calculateCidFromBuffer(file.buffer);
          if (cid) {
            verificationResult = await blockchainService.verifyCertificateByCid(cid);
          } else {
            throw new Error('Could not calculate a hash for the provided file.');
          }
        } else {
            return;
        }

        if (verificationResult?.status === 'VERIFIED' && verificationResult.certificate && verificationResult.consensus) {
            await handleVerificationSuccess(verificationResult.certificate, verificationResult.consensus);
        } else {
            await handleVerificationFailure(verificationResult?.message || "Certificate not found.", verificationResult?.consensus);
        }

    } catch (error: any) {
        console.error("Verification failed:", error);
        await handleVerificationFailure(error.message || 'An unknown error occurred.');
    }
  };

  return (
    <div className="w-full">
      <div className="view-container">
        <h2 className="text-xl font-semibold text-center text-slate-300 mb-1">Verify Certificate</h2>
        <p className="text-center text-slate-500 mb-6">Verify a certificate against the simulated decentralized ledger.</p>
        
        <div className="flex p-1 bg-slate-800 rounded-lg mb-6">
          <button onClick={() => handleModeChange('id')} className={`w-full py-2 rounded-md transition-colors text-sm font-medium ${mode === 'id' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>By Certificate ID</button>
          <button onClick={() => handleModeChange('file')} className={`w-full py-2 rounded-md transition-colors text-sm font-medium ${mode === 'file' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>By File Upload</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'id' ? (
            <InputField 
              icon={<FileBadgeIcon className="w-5 h-5 text-slate-500" />}
              type="text" 
              value={certificateId} 
              onChange={e => { setCertificateId(e.target.value); resetState(); }} 
              placeholder="Enter Certificate ID" 
              required
            />
          ) : (
            <label htmlFor="verifier-file-upload" className="relative cursor-pointer bg-slate-800 border-2 border-dashed border-slate-600 rounded-md font-semibold text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-all duration-200 flex flex-col items-center justify-center p-6">
                <UploadCloudIcon className="w-8 h-8 mb-2"/>
                <span className="text-center">{file ? file.name : 'Select file to verify'}</span>
                <input id="verifier-file-upload" type="file" onChange={handleFileChange} className="sr-only" required/>
            </label>
          )}
          <button type="submit" disabled={status === VerificationStatus.PENDING || (mode === 'id' ? !certificateId : !file)} className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40">Verify</button>
        </form>
      </div>

      {status === VerificationStatus.PENDING && <Loader />}
      
      {result && (
        <div className="mt-8">
            <div className={`flex flex-col space-y-2 p-4 rounded-xl mb-4 ${result.status === 'VERIFIED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                <div className="flex items-center space-x-3">
                    {result.status === 'VERIFIED' ? <CheckCircleIcon className="w-6 h-6"/> : <XCircleIcon className="w-6 h-6"/>}
                    <p className="font-semibold">{result.status === 'VERIFIED' ? 'Certificate Verified' : 'Verification Failed'}</p>
                </div>
                 <p className="text-sm pl-9">{result.message}</p>
                 {result.consensus && (
                   <p className="text-xs pl-9 opacity-70">
                     (Consensus: {result.consensus.nodesFound} / {result.consensus.totalNodes} nodes)
                   </p>
                )}
            </div>
            {result.certificate && <CertificateCard certificate={result.certificate} />}
        </div>
      )}
    </div>
  );
};

export default VerifierView;