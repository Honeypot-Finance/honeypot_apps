import { makeAutoObservable, runInAction } from 'mobx';
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
  txHash?: string; // Alias for originTransactionHash
  requestId?: string; // RocketX request ID for status tracking
  universalTxId?: string; // Universal Account transaction ID
  userAddress: string;
  errorMessage?: string;
  // Detailed transaction info from status API
  originTransactionHash?: string; // Source chain transaction hash
  destinationTransactionHash?: string; // Destination chain transaction hash
  originTransactionUrl?: string; // Source chain explorer URL
  destinationTransactionUrl?: string; // Destination chain explorer URL
  actualAmount?: string; // Actual received amount
  transactionTime?: string; // ISO timestamp
  subState?: string; // Sub-state like "withdraw_success"
}

class CrossChainTransactionService {
  transactions: CrossChainTransaction[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadTransactions();
    this.startStatusPolling();
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
    requestId?: string;
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
      requestId: params.requestId,
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
    universalTxId?: string,
    statusDetails?: {
      originTransactionHash?: string;
      destinationTransactionHash?: string;
      originTransactionUrl?: string;
      destinationTransactionUrl?: string;
      actualAmount?: string;
      transactionTime?: string;
      subState?: string;
    }
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
      if (statusDetails) {
        if (statusDetails.originTransactionHash) {
          transaction.originTransactionHash = statusDetails.originTransactionHash;
        }
        if (statusDetails.destinationTransactionHash) {
          transaction.destinationTransactionHash = statusDetails.destinationTransactionHash;
        }
        if (statusDetails.originTransactionUrl) {
          transaction.originTransactionUrl = statusDetails.originTransactionUrl;
        }
        if (statusDetails.destinationTransactionUrl) {
          transaction.destinationTransactionUrl = statusDetails.destinationTransactionUrl;
        }
        if (statusDetails.actualAmount) {
          transaction.actualAmount = statusDetails.actualAmount;
          transaction.toToken.amount = statusDetails.actualAmount; // Update the actual received amount
        }
        if (statusDetails.transactionTime) {
          transaction.transactionTime = statusDetails.transactionTime;
        }
        if (statusDetails.subState) {
          transaction.subState = statusDetails.subState;
        }
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

  // Start automatic status polling for pending transactions
  private startStatusPolling() {
    // Poll every 60 seconds (1 minute)
    this.pollingInterval = setInterval(() => {
      this.checkPendingTransactions();
    }, 60000);
  }

  // Stop polling (useful for cleanup)
  stopStatusPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Check status of all pending transactions
  private async checkPendingTransactions() {
    const pendingTransactions = this.transactions.filter(
      tx => tx.status === 'pending' && tx.requestId
    );

    if (pendingTransactions.length === 0) {
      return;
    }

    // Import rocketxSwapService dynamically to avoid circular dependency
    const { rocketxSwapService } = await import('./rocketxSwapService');

    for (const tx of pendingTransactions) {
      try {
        const statusResponse = await rocketxSwapService.getSwapStatus(
          tx.requestId!,
          tx.originTransactionHash || tx.txHash
        );

        if (statusResponse) {
          const data = statusResponse;
          const status = data.status;

          runInAction(() => {
            if (status === 'success') {
              // Extract detailed transaction info
              // RocketX API returns: originTransactionHash, destinationTransactionHash, etc.
              const statusDetails = {
                originTransactionHash: data.originTransactionHash || data.fromTxHash,
                destinationTransactionHash: data.destinationTransactionHash || data.toTxHash,
                originTransactionUrl: data.originTransactionUrl,
                destinationTransactionUrl: data.destinationTransactionUrl,
                actualAmount: data.actualAmount ? data.actualAmount.toString() : data.toAmount,
                transactionTime: data.transactionTime,
                subState: data.subState,
              };

              this.updateTransactionStatus(
                tx.id,
                'completed',
                data.originTransactionHash || data.fromTxHash || tx.txHash,
                undefined,
                tx.universalTxId,
                statusDetails
              );
            } else if (status === 'failed') {
              this.updateTransactionStatus(tx.id, 'failed', tx.txHash, 'Swap failed at exchange', tx.universalTxId);
            }
          });
        }
      } catch (error) {
        // Continue checking other transactions
      }
    }
  }

  // Manual trigger to check pending transactions immediately
  async refreshPendingTransactions() {
    await this.checkPendingTransactions();
  }
}

export const crossChainTransactionService = new CrossChainTransactionService();