import React from 'react';
import { Certificate } from '../types';
import { ClipboardIcon, CheckIcon, ShieldCheckIcon, CubeIcon, FileBadgeIcon } from './Icons';

interface CertificateCardProps {
  certificate: Certificate;
}

const useCopyToClipboard = () => {
    const [isCopied, setIsCopied] = React.useState(false);

    const copy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return [isCopied, copy] as const;
};

const ClipboardCopy: React.FC<{ text: string }> = ({ text }) => {
    const [isCopied, copy] = useCopyToClipboard();

    return (
        <button onClick={() => copy(text)} className="p-1 rounded-md hover:bg-slate-600/50 transition-colors" aria-label="Copy to clipboard">
            {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4 text-slate-500 hover:text-slate-300" />}
        </button>
    );
};

const DetailRow: React.FC<{ label: string; value: string | number; canCopy?: boolean; link?: string }> = ({ label, value, canCopy = false, link }) => {
  const displayValue = typeof value === 'string' && value.length > 20 ? `${value.substring(0, 10)}...${value.substring(value.length - 10)}` : value;

  return (
    <div className="flex justify-between items-center py-2.5">
      <dt className="text-sm font-medium text-slate-400">{label}</dt>
      <dd className="text-sm text-slate-200 font-mono flex items-center gap-2">
        {link ? (
           <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline hover:text-indigo-400 transition-colors"
                title="View on IPFS Gateway"
            >
                {displayValue}
            </a>
        ) : (
            <span>{displayValue}</span>
        )}
        {canCopy && <ClipboardCopy text={String(value)} />}
      </dd>
    </div>
  );
};

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
  const ipfsGatewayUrl = `https://gateway.pinata.cloud/ipfs/${certificate.ipfsCid}`;
  
  return (
    <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-sm animate-fade-in overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
           <div className="flex items-center space-x-4">
              <img src={`data:image/svg+xml;base64,${certificate.avatarBase64}`} alt="User Avatar" className="w-14 h-14 rounded-full bg-slate-700 border-2 border-slate-600" />
              <div>
                <h3 className="text-lg font-semibold text-white">{certificate.ownerName}</h3>
                <p className="text-sm text-slate-400 font-mono">{certificate.username}</p>
              </div>
           </div>
           <div className="flex flex-col items-end">
              <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium bg-green-500/10 px-2 py-1 rounded-full">
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                Verified
              </span>
           </div>
        </div>
        
        <div className="space-y-1 divide-y divide-slate-700/50">
            <DetailRow label="File Name" value={certificate.fileName} />
            <DetailRow label="Issuer" value={certificate.issuerName} />
            <DetailRow label="Issue Date" value={new Date(certificate.issueDate).toLocaleString()} />
        </div>

        <div className="mt-4 border-t border-slate-700 pt-4">
          <h4 className="text-sm font-semibold text-indigo-400 mb-1 flex items-center gap-2">
            <CubeIcon className="w-4 h-4" />
            Ledger Details
          </h4>
          <div className="space-y-1 divide-y divide-slate-700/50">
            <DetailRow label="Certificate ID" value={certificate.id} canCopy />
            <DetailRow label="Transaction ID" value={certificate.transactionId} canCopy />
            <DetailRow label="IPFS CID" value={certificate.ipfsCid} canCopy link={ipfsGatewayUrl} />
            <DetailRow label="Block Number" value={certificate.blockNumber} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;