import { makeAutoObservable } from 'mobx';
import { Network } from '@honeypot/shared/config/chains/chain';
import { Token } from '@honeypot/shared/lib/contract/token/token';

export interface CrossChainTransaction {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  fromToken: {
    symbol: string;
    name: string;
    address: string;
    amount: string;
    logoURI?: string;
  };
  toToken: {
    symbol: string;
    name: string;
    address: string;
    amount: string;
    logoURI?: string;
  };
  fromChain: {
    chainId: number;
    name: string;
    iconUrl: string;
  };
  toChain: {
    chainId: number;
    name: string;
    iconUrl: string;
  };
  timestamp: number;
  txHash?: string;
  universalTxId?: string; // Universal Account transaction ID
  userAddress: string;
  errorMessage?: string;
}

class CrossChainTransactionService {
  transactions: CrossChainTransaction[] = [];
  
  constructor() {
    makeAutoObservable(this);
    this.loadTransactions();
  }
  
  private loadTransactions() {
    try {
      const stored = localStorage.getItem('crossChainTransactions');
      if (stored) {
        this.transactions = JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  }
  
  private saveTransactions() {
    try {
      localStorage.setItem('crossChainTransactions', JSON.stringify(this.transactions));
    } catch (err) {
      console.error('Failed to save transactions:', err);
    }
  }
  
  addTransaction(params: {
    fromToken: Token;
    toToken: Token;
    fromChain: Network;
    toChain: Network;
    fromAmount: string;
    toAmount: string;
    userAddress: string;
    txHash?: string;
  }): string {
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction: CrossChainTransaction = {
      id: transactionId,
      status: 'pending',
      fromToken: {
        symbol: params.fromToken.symbol,
        name: params.fromToken.name,
        address: params.fromToken.address,
        amount: params.fromAmount,
        logoURI: params.fromToken.logoURI,
      },
      toToken: {
        symbol: params.toToken.symbol,
        name: params.toToken.name,
        address: params.toToken.address,
        amount: params.toAmount,
        logoURI: params.toToken.logoURI,
      },
      fromChain: {
        chainId: params.fromChain.chainId,
        name: params.fromChain.displayName || params.fromChain.chain.name,
        iconUrl: params.fromChain.iconUrl,
      },
      toChain: {
        chainId: params.toChain.chainId,
        name: params.toChain.displayName || params.toChain.chain.name,
        iconUrl: params.toChain.iconUrl,
      },
      timestamp: Date.now(),
      txHash: params.txHash,
      userAddress: params.userAddress,
    };
    
    this.transactions.unshift(transaction);
    this.saveTransactions();
    
    return transactionId;
  }
  
  updateTransactionStatus(
    transactionId: string, 
    status: CrossChainTransaction['status'], 
    txHash?: string, 
    errorMessage?: string,
    universalTxId?: string
  ) {
    const transaction = this.transactions.find(tx => tx.id === transactionId);
    if (transaction) {
      transaction.status = status;
      if (txHash) {
        transaction.txHash = txHash;
      }
      if (errorMessage) {
        transaction.errorMessage = errorMessage;
      }
      if (universalTxId) {
        transaction.universalTxId = universalTxId;
      }
      this.saveTransactions();
    }
  }
  
  getTransactionsByUser(userAddress: string): CrossChainTransaction[] {
    return this.transactions.filter(tx => 
      tx.userAddress.toLowerCase() === userAddress.toLowerCase()
    );
  }
  
  getAllTransactions(): CrossChainTransaction[] {
    return this.transactions;
  }
  
  clearTransactions() {
    this.transactions = [];
    this.saveTransactions();
  }
}

export const crossChainTransactionService = new CrossChainTransactionService();