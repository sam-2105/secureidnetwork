
import React, { useState } from 'react';

interface VerificationFormProps {
  onSubmit: (fullName: string, documentId: string) => void;
  isLoading: boolean;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ onSubmit, isLoading }) => {
  const [fullName, setFullName] = useState('');
  const [documentId, setDocumentId] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (fullName.trim() && documentId.trim()) {
      onSubmit(fullName, documentId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g., Jane Doe"
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="documentId" className="block text-sm font-medium text-slate-300 mb-2">
          Document ID / Number
        </label>
        <input
          type="text"
          id="documentId"
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
          placeholder="e.g., XZ12345678"
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !fullName || !documentId}
        className="w-full flex items-center justify-center px-4 py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? 'Verifying on Ledger...' : 'Verify Identity'}
      </button>
    </form>
  );
};

export default VerificationForm;
