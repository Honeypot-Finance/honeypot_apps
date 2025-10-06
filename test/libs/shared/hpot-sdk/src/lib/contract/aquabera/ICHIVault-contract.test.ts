import { ICHIVaultContract } from '../../../../../../../libs/shared/hpot-sdk/src/lib/contract/aquabera/ICHIVault-contract';
import { wallet } from '../../../../../../../libs/shared/hpot-sdk/src/lib/wallet/wallet';
import { Token } from '../../../../../../../libs/shared/hpot-sdk/src/lib/contract/token/token';
import { ContractWrite } from '../../../../../../../libs/shared/hpot-sdk/src/lib/utils/utils';
import { zeroAddress } from 'viem';

// Mock dependencies
jest.mock('../../../../../../../libs/shared/hpot-sdk/src/lib/wallet/wallet', () => ({
  wallet: {
    publicClient: {},
    walletClient: {
      account: { address: '0x123' },
    },
    currentChainId: 80094,
    contracts: {
      rewardVaultFactory: {
        loadBgtVaultAddressByStakingToken: jest.fn(),
      },
    },
  },
}));

jest.mock('../../../../../../../libs/shared/hpot-sdk/src/lib/contract/token/token', () => ({
  Token: {
    getToken: jest.fn(),
  },
}));

jest.mock('../../../../../../../libs/shared/hpot-sdk/src/lib/utils/utils', () => ({
  ContractWrite: jest.fn(),
}));

jest.mock('viem', () => ({
  getContract: jest.fn(() => ({
    read: {
      getTotalAmounts: jest.fn(),
      token0: jest.fn(),
      token1: jest.fn(),
      totalSupply: jest.fn(),
      balanceOf: jest.fn(),
    },
    write: {
      deposit: jest.fn(),
      withdraw: jest.fn(),
    },
  })),
  zeroAddress: '0x0000000000000000000000000000000000000000',
}));

const mockWallet = wallet as jest.Mocked<typeof wallet>;
const mockToken = Token as jest.Mocked<typeof Token>;
const mockContractWrite = ContractWrite as jest.MockedClass<typeof ContractWrite>;

describe('ICHIVaultContract', () => {
  let vaultContract: ICHIVaultContract;
  const mockAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`;

  beforeEach(() => {
    jest.clearAllMocks();
    ICHIVaultContract.vaultsMap.clear();
    
    vaultContract = new ICHIVaultContract({
      address: mockAddress,
      name: 'Test Vault',
    });
  });

  describe('Constructor and Initialization', () => {
    it('should create vault with default values', () => {
      const vault = new ICHIVaultContract({});

      expect(vault.address).toBe(zeroAddress);
      expect(vault.name).toBe('ICHIVault');
      expect(vault.fee).toBe(0);
      expect(vault.isInitialized).toBe(false);
      expect(vault.transactionPending).toBe(false);
      expect(vault.apr).toBe(0);
    });

    it('should create vault with provided values', () => {
      const vault = new ICHIVaultContract({
        address: mockAddress,
        name: 'Custom Vault',
        fee: 500,
        apr: 15.5,
      });

      expect(vault.address).toBe(mockAddress);
      expect(vault.name).toBe('Custom Vault');
      expect(vault.fee).toBe(500);
      expect(vault.apr).toBe(15.5);
    });

    it('should initialize totalAmountsWithoutDecimal correctly', () => {
      expect(vaultContract.totalAmountsWithoutDecimal.total0).toBeUndefined();
      expect(vaultContract.totalAmountsWithoutDecimal.total1).toBeUndefined();
    });

    it('should initialize detailed APR correctly', () => {
      expect(vaultContract.detailedApr).toEqual({
        feeApr_1d: 0,
        feeApr_3d: 0,
        feeApr_7d: 0,
        feeApr_30d: 0,
      });
    });
  });

  describe('Static Methods', () => {
    describe('getVault', () => {
      it('should create new vault if not exists', () => {
        const vault = ICHIVaultContract.getVault({
          address: mockAddress,
          name: 'New Vault',
        });

        expect(vault).toBeInstanceOf(ICHIVaultContract);
        expect(vault?.address).toBe(mockAddress);
        expect(vault?.name).toBe('New Vault');
      });

      it('should return existing vault if already exists', () => {
        const firstVault = ICHIVaultContract.getVault({
          address: mockAddress,
          name: 'First Vault',
        });

        const secondVault = ICHIVaultContract.getVault({
          address: mockAddress,
          name: 'Second Vault',
        });

        expect(firstVault).toBe(secondVault);
        expect(secondVault?.name).toBe('Second Vault'); // Should update data
      });

      it('should return undefined for invalid address', () => {
        const vault = ICHIVaultContract.getVault({
          address: undefined as any,
        });

        expect(vault).toBeUndefined();
      });

      it('should handle case-insensitive addresses', () => {
        const lowerCaseAddress = mockAddress.toLowerCase() as `0x${string}`;
        const upperCaseAddress = mockAddress.toUpperCase() as `0x${string}`;

        const vault1 = ICHIVaultContract.getVault({
          address: lowerCaseAddress,
          name: 'Vault 1',
        });

        const vault2 = ICHIVaultContract.getVault({
          address: upperCaseAddress,
          name: 'Vault 2',
        });

        expect(vault1).toBe(vault2);
      });
    });

    describe('setVault', () => {
      it('should set vault in map', () => {
        const vault = new ICHIVaultContract({ address: mockAddress });
        ICHIVaultContract.setVault(mockAddress, vault);

        const retrievedVault = ICHIVaultContract.getVault({ address: mockAddress });
        expect(retrievedVault).toBe(vault);
      });
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      vaultContract.totalAmountsWithoutDecimal = {
        total0: BigInt('1000000000000000000000'), // 1000 tokens
        total1: BigInt('2000000000000000000000'), // 2000 tokens
      };
      
      vaultContract.token0 = {
        decimals: 18,
        derivedUSD: 1.5,
      } as any;
      
      vaultContract.token1 = {
        decimals: 18,
        derivedUSD: 2.0,
      } as any;
    });

    describe('tvlUSD', () => {
      it('should calculate TVL in USD correctly', () => {
        const expectedTvl = (1000 * 1.5) + (2000 * 2.0); // 1500 + 4000 = 5500
        expect(vaultContract.tvlUSD).toBe(expectedTvl);
      });

      it('should handle missing token prices', () => {
        vaultContract.token0 = { decimals: 18, derivedUSD: undefined } as any;
        vaultContract.token1 = { decimals: 18, derivedUSD: undefined } as any;

        expect(vaultContract.tvlUSD).toBe(0);
      });

      it('should handle undefined tokens', () => {
        vaultContract.token0 = undefined;
        vaultContract.token1 = undefined;

        expect(vaultContract.tvlUSD).toBe(0);
      });
    });

    describe('totalSupply', () => {
      it('should calculate total supply correctly', () => {
        const totalSupply = vaultContract.totalSupply;
        
        expect(totalSupply.total0).toBe('1000');
        expect(totalSupply.total1).toBe('2000');
      });

      it('should handle undefined totalAmountsWithoutDecimal', () => {
        vaultContract.totalAmountsWithoutDecimal = undefined as any;
        
        const totalSupply = vaultContract.totalSupply;
        expect(totalSupply.total0).toBe(0);
        expect(totalSupply.total1).toBe(0);
      });

      it('should handle different token decimals', () => {
        vaultContract.token0 = { decimals: 6 } as any;
        vaultContract.token1 = { decimals: 8 } as any;
        
        const totalSupply = vaultContract.totalSupply;
        expect(totalSupply.total0).toBe('1000000000000'); // 1000 * 10^12 / 10^6
        expect(totalSupply.total1).toBe('20000000000000'); // 2000 * 10^18 / 10^8
      });
    });

    describe('userTokenAmountsWithoutDecimal', () => {
      beforeEach(() => {
        vaultContract.totalsupplyShares = BigInt('10000000000000000000000'); // 10000 shares
        vaultContract.userShares = BigInt('1000000000000000000000'); // 1000 shares (10%)
      });

      it('should calculate user token amounts correctly', () => {
        const userAmounts = vaultContract.userTokenAmountsWithoutDecimal;
        
        // User has 10% of shares, so should get 10% of total amounts
        expect(userAmounts.total0).toBe(BigInt('100000000000000000000')); // 100 tokens
        expect(userAmounts.total1).toBe(BigInt('200000000000000000000')); // 200 tokens
      });

      it('should return zero when no shares', () => {
        vaultContract.userShares = BigInt(0);
        
        const userAmounts = vaultContract.userTokenAmountsWithoutDecimal;
        expect(userAmounts.total0).toBe(BigInt(0));
        expect(userAmounts.total1).toBe(BigInt(0));
      });

      it('should return zero when missing data', () => {
        vaultContract.totalsupplyShares = undefined;
        
        const userAmounts = vaultContract.userTokenAmountsWithoutDecimal;
        expect(userAmounts.total0).toBe(0);
        expect(userAmounts.total1).toBe(0);
      });
    });

    describe('userTVLUSD', () => {
      beforeEach(() => {
        vaultContract.totalsupplyShares = BigInt('10000000000000000000000');
        vaultContract.userShares = BigInt('1000000000000000000000');
      });

      it('should calculate user TVL in USD correctly', () => {
        const expectedUserTvl = (100 * 1.5) + (200 * 2.0); // 150 + 400 = 550
        expect(vaultContract.userTVLUSD).toBe(expectedUserTvl);
      });

      it('should handle missing token prices', () => {
        vaultContract.token0 = { decimals: 18, derivedUSD: undefined } as any;
        vaultContract.token1 = { decimals: 18, derivedUSD: undefined } as any;

        expect(vaultContract.userTVLUSD).toBe(0);
      });
    });

    describe('userTokenAmounts', () => {
      beforeEach(() => {
        vaultContract.totalsupplyShares = BigInt('10000000000000000000000');
        vaultContract.userShares = BigInt('1000000000000000000000');
      });

      it('should calculate user token amounts with decimals', () => {
        const userAmounts = vaultContract.userTokenAmounts;
        
        expect(userAmounts.total0).toBe('100');
        expect(userAmounts.total1).toBe('200');
      });

      it('should return zero when tokens are undefined', () => {
        vaultContract.token0 = undefined;
        vaultContract.token1 = undefined;
        
        const userAmounts = vaultContract.userTokenAmounts;
        expect(userAmounts.total0).toBe(0);
        expect(userAmounts.total1).toBe(0);
      });
    });
  });

  describe('Contract Interaction Methods', () => {
    let mockContract: any;

    beforeEach(() => {
      mockContract = {
        read: {
          getTotalAmounts: jest.fn(),
          token0: jest.fn(),
          token1: jest.fn(),
          totalSupply: jest.fn(),
          balanceOf: jest.fn(),
        },
        write: {
          deposit: jest.fn(),
          withdraw: jest.fn(),
        },
      };

      // Mock getContract to return our mock contract
      const { getContract } = require('viem');
      (getContract as jest.Mock).mockReturnValue(mockContract);
    });

    describe('getTotalAmounts', () => {
      it('should fetch and cache total amounts', async () => {
        const mockAmounts = [BigInt('1000000000000000000000'), BigInt('2000000000000000000000')];
        mockContract.read.getTotalAmounts.mockResolvedValue(mockAmounts);

        const result = await vaultContract.getTotalAmounts();

        expect(mockContract.read.getTotalAmounts).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockAmounts);
        expect(vaultContract.totalAmountsWithoutDecimal.total0).toBe(mockAmounts[0]);
        expect(vaultContract.totalAmountsWithoutDecimal.total1).toBe(mockAmounts[1]);
      });

      it('should return cached amounts if already fetched', async () => {
        vaultContract.totalAmountsWithoutDecimal = {
          total0: BigInt('500000000000000000000'),
          total1: BigInt('1500000000000000000000'),
        };

        const result = await vaultContract.getTotalAmounts();

        expect(mockContract.read.getTotalAmounts).not.toHaveBeenCalled();
        expect(result).toEqual(vaultContract.totalAmountsWithoutDecimal);
      });
    });

    describe('getToken0', () => {
      it('should fetch and cache token0', async () => {
        const mockTokenAddress = '0xtoken0address';
        const mockToken = { address: mockTokenAddress, symbol: 'TOKEN0' };
        
        mockContract.read.token0.mockResolvedValue(mockTokenAddress);
        mockToken.getToken.mockReturnValue(mockToken);

        const result = await vaultContract.getToken0();

        expect(mockContract.read.token0).toHaveBeenCalledTimes(1);
        expect(mockToken.getToken).toHaveBeenCalledWith({
          address: mockTokenAddress,
          chainId: '80094',
        });
        expect(result).toBe(mockToken);
        expect(vaultContract.token0).toBe(mockToken);
      });

      it('should return cached token0 if already fetched', async () => {
        const cachedToken = { address: '0xcached', symbol: 'CACHED' };
        vaultContract.token0 = cachedToken as any;

        const result = await vaultContract.getToken0();

        expect(mockContract.read.token0).not.toHaveBeenCalled();
        expect(result).toBe(cachedToken);
      });

      it('should return undefined if no contract', async () => {
        vaultContract.contract = undefined as any;

        const result = await vaultContract.getToken0();

        expect(result).toBeUndefined();
      });
    });

    describe('getToken1', () => {
      it('should fetch and cache token1', async () => {
        const mockTokenAddress = '0xtoken1address';
        const mockToken = { address: mockTokenAddress, symbol: 'TOKEN1' };
        
        mockContract.read.token1.mockResolvedValue(mockTokenAddress);
        mockToken.getToken.mockReturnValue(mockToken);

        const result = await vaultContract.getToken1();

        expect(mockContract.read.token1).toHaveBeenCalledTimes(1);
        expect(mockToken.getToken).toHaveBeenCalledWith({
          address: mockTokenAddress,
          chainId: '80094',
        });
        expect(result).toBe(mockToken);
        expect(vaultContract.token1).toBe(mockToken);
      });

      it('should return cached token1 if already fetched', async () => {
        const cachedToken = { address: '0xcached', symbol: 'CACHED' };
        vaultContract.token1 = cachedToken as any;

        const result = await vaultContract.getToken1();

        expect(mockContract.read.token1).not.toHaveBeenCalled();
        expect(result).toBe(cachedToken);
      });
    });

    describe('getTotalSupply', () => {
      it('should fetch and cache total supply', async () => {
        const mockTotalSupply = BigInt('10000000000000000000000');
        mockContract.read.totalSupply.mockResolvedValue(mockTotalSupply);

        const result = await vaultContract.getTotalSupply();

        expect(mockContract.read.totalSupply).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockTotalSupply);
        expect(vaultContract.totalsupplyShares).toBe(mockTotalSupply);
      });

      it('should return cached total supply if already fetched', async () => {
        const cachedSupply = BigInt('5000000000000000000000');
        vaultContract.totalsupplyShares = cachedSupply;

        const result = await vaultContract.getTotalSupply();

        expect(mockContract.read.totalSupply).not.toHaveBeenCalled();
        expect(result).toBe(cachedSupply);
      });
    });

    describe('getBalanceOf', () => {
      it('should fetch user balance', async () => {
        const mockBalance = BigInt('1000000000000000000000');
        const userAddress = '0xuser123';
        mockContract.read.balanceOf.mockResolvedValue(mockBalance);

        const result = await vaultContract.getBalanceOf(userAddress);

        expect(mockContract.read.balanceOf).toHaveBeenCalledWith([userAddress]);
        expect(result).toBe(mockBalance);
        expect(vaultContract.userShares).toBe(mockBalance);
      });

      it('should return undefined if no contract', async () => {
        vaultContract.contract = undefined as any;

        const result = await vaultContract.getBalanceOf('0xuser');

        expect(result).toBeUndefined();
      });
    });
  });

  describe('Transaction Methods', () => {
    let mockContractWriteInstance: any;

    beforeEach(() => {
      mockContractWriteInstance = {
        call: jest.fn().mockResolvedValue('0xtxhash'),
        finally: jest.fn(function(this: any, callback: () => void) {
          callback();
          return this;
        }),
      };

      mockContractWrite.mockImplementation(() => mockContractWriteInstance);
    });

    describe('deposit', () => {
      it('should execute deposit transaction', async () => {
        const deposit0 = BigInt('1000000000000000000000');
        const deposit1 = BigInt('2000000000000000000000');
        const toAddress = '0xrecipient';

        mockWallet.walletClient = { account: { address: '0xuser' } } as any;

        const result = await vaultContract.deposit(deposit0, deposit1, toAddress);

        expect(vaultContract.transactionPending).toBe(false); // Should be reset after finally
        expect(mockContractWrite).toHaveBeenCalledWith(
          expect.any(Function),
          { action: 'deposit' }
        );
        expect(mockContractWriteInstance.call).toHaveBeenCalledWith([
          deposit0,
          deposit1,
          toAddress,
        ]);
      });

      it('should set transaction pending during execution', async () => {
        const deposit0 = BigInt('1000000000000000000000');
        const deposit1 = BigInt('2000000000000000000000');
        const toAddress = '0xrecipient';

        mockWallet.walletClient = { account: { address: '0xuser' } } as any;
        
        // Mock call to check pending state
        mockContractWriteInstance.call.mockImplementation(() => {
          expect(vaultContract.transactionPending).toBe(true);
          return Promise.resolve('0xtxhash');
        });

        await vaultContract.deposit(deposit0, deposit1, toAddress);
      });

      it('should return undefined if no contract', async () => {
        vaultContract.contract = undefined as any;

        const result = await vaultContract.deposit(BigInt(1000), BigInt(2000), '0xto');

        expect(result).toBeUndefined();
        expect(vaultContract.transactionPending).toBe(false);
      });

      it('should return undefined if no wallet account', async () => {
        mockWallet.walletClient = { account: undefined } as any;

        const result = await vaultContract.deposit(BigInt(1000), BigInt(2000), '0xto');

        expect(result).toBeUndefined();
      });
    });

    describe('withdraw', () => {
      it('should execute withdraw transaction', async () => {
        const shares = BigInt('1000000000000000000000');
        const toAddress = '0xrecipient';

        mockWallet.walletClient = { account: { address: '0xuser' } } as any;

        const result = await vaultContract.withdraw(shares, toAddress);

        expect(vaultContract.transactionPending).toBe(false);
        expect(mockContractWrite).toHaveBeenCalledWith(
          expect.any(Function),
          { action: 'withdraw' }
        );
        expect(mockContractWriteInstance.call).toHaveBeenCalledWith([
          shares,
          toAddress,
        ]);
      });

      it('should set transaction pending during execution', async () => {
        const shares = BigInt('1000000000000000000000');
        const toAddress = '0xrecipient';

        mockWallet.walletClient = { account: { address: '0xuser' } } as any;
        
        mockContractWriteInstance.call.mockImplementation(() => {
          expect(vaultContract.transactionPending).toBe(true);
          return Promise.resolve('0xtxhash');
        });

        await vaultContract.withdraw(shares, toAddress);
      });

      it('should return undefined if no contract', async () => {
        vaultContract.contract = undefined as any;

        const result = await vaultContract.withdraw(BigInt(1000), '0xto');

        expect(result).toBeUndefined();
        expect(vaultContract.transactionPending).toBe(false);
      });
    });
  });

  describe('setData', () => {
    it('should update vault properties', () => {
      const newData = {
        name: 'Updated Vault',
        fee: 1000,
        apr: 25.5,
        isInitialized: true,
      };

      vaultContract.setData(newData);

      expect(vaultContract.name).toBe('Updated Vault');
      expect(vaultContract.fee).toBe(1000);
      expect(vaultContract.apr).toBe(25.5);
      expect(vaultContract.isInitialized).toBe(true);
    });

    it('should partially update properties', () => {
      const originalName = vaultContract.name;
      
      vaultContract.setData({ fee: 500 });

      expect(vaultContract.name).toBe(originalName); // Should remain unchanged
      expect(vaultContract.fee).toBe(500);
    });
  });

  describe('getBgtVaultAddress', () => {
    it('should fetch BGT vault address', async () => {
      const mockBgtAddress = '0xbgtaddress' as `0x${string}`;
      mockWallet.contracts.rewardVaultFactory.loadBgtVaultAddressByStakingToken.mockResolvedValue(mockBgtAddress);

      const result = await vaultContract.getBgtVaultAddress();

      expect(mockWallet.contracts.rewardVaultFactory.loadBgtVaultAddressByStakingToken).toHaveBeenCalledWith(mockAddress);
      expect(result).toBe(mockBgtAddress);
      expect(vaultContract.bgtVaultAddress).toBe(mockBgtAddress);
    });

    it('should return cached BGT vault address', async () => {
      const cachedAddress = '0xcachedaddress' as `0x${string}`;
      vaultContract.bgtVaultAddress = cachedAddress;

      const result = await vaultContract.getBgtVaultAddress();

      expect(mockWallet.contracts.rewardVaultFactory.loadBgtVaultAddressByStakingToken).not.toHaveBeenCalled();
      expect(result).toBe(cachedAddress);
    });

    it('should return undefined if no reward vault factory', async () => {
      mockWallet.contracts.rewardVaultFactory = undefined as any;

      const result = await vaultContract.getBgtVaultAddress();

      expect(result).toBeUndefined();
    });

    it('should return undefined if no vault address', async () => {
      vaultContract.address = undefined as any;

      const result = await vaultContract.getBgtVaultAddress();

      expect(result).toBeUndefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle BigInt calculations with zero values', () => {
      vaultContract.totalAmountsWithoutDecimal = {
        total0: BigInt(0),
        total1: BigInt(0),
      };
      vaultContract.totalsupplyShares = BigInt(0);
      vaultContract.userShares = BigInt(0);

      expect(vaultContract.userTokenAmountsWithoutDecimal.total0).toBe(0);
      expect(vaultContract.userTokenAmountsWithoutDecimal.total1).toBe(0);
    });

    it('should handle division by zero in user amounts calculation', () => {
      vaultContract.totalAmountsWithoutDecimal = {
        total0: BigInt('1000000000000000000000'),
        total1: BigInt('2000000000000000000000'),
      };
      vaultContract.totalsupplyShares = BigInt(0); // Division by zero
      vaultContract.userShares = BigInt('1000000000000000000000');

      expect(vaultContract.userTokenAmountsWithoutDecimal.total0).toBe(0);
      expect(vaultContract.userTokenAmountsWithoutDecimal.total1).toBe(0);
    });

    it('should handle missing token decimals in totalSupply calculation', () => {
      vaultContract.totalAmountsWithoutDecimal = {
        total0: BigInt('1000000000000000000000'),
        total1: BigInt('2000000000000000000000'),
      };
      vaultContract.token0 = undefined;
      vaultContract.token1 = undefined;

      const totalSupply = vaultContract.totalSupply;
      expect(totalSupply.total0).toBe('1'); // Uses default 18 decimals
      expect(totalSupply.total1).toBe('2');
    });
  });
});