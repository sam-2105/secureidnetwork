import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { LogEntry } from '../types';
import { TerminalIcon, FileBadgeIcon } from '../components/Icons';

const LogTypeIndicator: React.FC<{ type: LogEntry['type'] }> = ({ type }) => {
    const baseClasses = "font-mono text-xs font-bold px-2 py-0.5 rounded";
    switch (type) {
        case 'SUCCESS': return <span className={`${baseClasses} bg-green-500/20 text-green-400`}>SUCCESS</span>;
        case 'ERROR': return <span className={`${baseClasses} bg-red-500/20 text-red-400`}>ERROR</span>;
        case 'SYSTEM': return <span className={`${baseClasses} bg-sky-500/20 text-sky-400`}>SYSTEM</span>;
        case 'INFO':
        default:
            return <span className={`${baseClasses} bg-slate-600/50 text-slate-300`}>INFO</span>;
    }
};


const MonitorView: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [documents, setDocuments] = useState<Record<string, {name: string, type: string}>>({});

    useEffect(() => {
        const interval = setInterval(() => {
            setLogs(storageService.getLogs());
            setDocuments(storageService.getDocuments());
        }, 1000); // Poll for updates every second

        // Initial load
        setLogs(storageService.getLogs());
        setDocuments(storageService.getDocuments());

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full space-y-8 animate-fade-in">
            {/* Activity Log Section */}
            <div>
                <h2 className="text-xl font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <TerminalIcon className="w-6 h-6 text-indigo-400" />
                    Network Activity Log
                </h2>
                <div className="view-container !p-0 max-h-[400px] overflow-y-auto">
                    <div className="divide-y divide-slate-800">
                        {logs.length > 0 ? logs.map((log, index) => (
                            <div key={index} className="p-4 flex items-start gap-4">
                                <LogTypeIndicator type={log.type} />
                                <div className="flex-1">
                                    <p className="text-sm text-slate-200">{log.message}</p>
                                    <p className="text-xs text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="p-4 text-center text-slate-500">No activity logged yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Store Section */}
            <div>
                <h2 className="text-xl font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <FileBadgeIcon className="w-6 h-6 text-indigo-400" />
                    Simulated Document Store
                </h2>
                <div className="view-container !p-0">
                     <div className="divide-y divide-slate-800">
                        {Object.keys(documents).length > 0 ? Object.entries(documents).map(([cid, doc]) => (
                            <div key={cid} className="p-4">
                                <p className="text-sm font-semibold text-slate-200">{doc.name}</p>
                                <p className="text-xs text-slate-400">Type: {doc.type}</p>
                                <p className="text-xs text-slate-500 font-mono mt-1">CID: {cid}</p>
                            </div>
                        )) : (
                             <p className="p-4 text-center text-slate-500">Document store is empty.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonitorView;