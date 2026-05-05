import { ethers } from 'ethers';

// Fix: Add ethers.Eip1193Provider type to window for Metamask injection.
declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

export enum Role {
  ISSUER = 'ISSUER',
  USER = 'USER',
  VERIFIER = 'VERIFIER',
  MONITOR = 'MONITOR',
}

export interface Certificate {
  id: string; 
  ownerName: string;
  issuerName: string;
  fileName: string;
  ipfsCid: string; // IPFS Content Identifier
  issueDate: string; // ISO String
  transactionId: string; // Transaction hash
  blockNumber: number; // Block number
  avatarBase64: string; // Base64 encoded image string
  username: string;
  // Fix: Add optional address properties for web3 compatibility.
  ownerAddress?: string;
  issuerAddress?: string;
}

export enum VerificationStatus {
  IDLE,
  PENDING,
  VERIFIED,
  FAILED,
}

export interface VerificationResult {
  status: 'VERIFIED' | 'FAILED';
  message: string;
  certificate?: Certificate;
  consensus?: { nodesFound: number; totalNodes: number };
}

export interface UserIdentity {
  username: string;
  ownerName: string;
  salt: string;
  hashedPassword: string;
}

// Fix: Define and export the Web3State interface.
export interface Web3State {
  provider: ethers.BrowserProvider;
  signer: ethers.Signer;
  account: string;
  network: string;
}

export interface LogEntry {
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'ERROR' | 'SYSTEM';
  message: string;
}