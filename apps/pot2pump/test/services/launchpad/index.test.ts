


import launchpad from '../../../services/launchpad/index.ts';

import { wallet } from '@honeypot/shared/lib/wallet';
// import { wallet } from '@honeypot/shared/lib/wallet';


import BigNumber from 'bignumber.js';

// Mock wallet
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    account: '0x1234567890123456789012345678901234567890',
    currentChainId: 80084,
    walletClient: {},
    contracts: {
      memeFactory: {
        contract: {
          simulate: {
            createPair: jest.fn(),
          },
        },
        createPair: {
          call: jest.fn(),
        },
      },
      memeFacade: {
        address: '0xmemefacade',
      },
      ftofactory: {
        contract: {
          simulate: {
            createFTO: jest.fn(),
          },
        },
        createFTO: {
          call: jest.fn(),
        },
        allPairsLength: {
          call: jest.fn(),
        },
        allPairs: {
          call: jest.fn(),
        },
      },
      ftofacade: {
        address: '0xftofacade',
      },
    },
    currentChain: {
      contracts: {
        algebraSwapRouter: '0xrouter',
        algebraPositionManager: '0xpositionmanager',
      },
      raisedTokenData: [
        {
          address: '0xhoney',
          symbol: 'HONEY',
          amount: BigInt('1000000000000000000000'),
        },
      ],
    },
  },
}));

// Mock trpcClient
jest.mock('../../../lib/trpc', () => ({
  trpcClient: {
    projects: {
      createProject: {
        mutate: jest.fn(),
      },
      createOrUpdateProjectInfo: {
        mutate: jest.fn(),
      },
      updateProjectLogo: {
        mutate: jest.fn(),
      },
      updateProjectBanner: {
        mutate: jest.fn(),
      },
    },
  },
}));

// Mock SIWE
jest.mock('../../../lib/siwe', () => ({
  createSiweMessage: jest.fn(),
}));

// Mock viem
jest.mock('viem', () => ({
  parseEventLogs: jest.fn(),
}));

// Mock ERC20ABI
jest.mock('../../../lib/abis/erc20', () => ({
  ERC20ABI: [],
}));

describe('LaunchPad Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Contract Getters', () => {
    it('should return meme factory contract', () => {
      expect(launchpad.memeFactoryContract).toBe(wallet.contracts.memeFactory);
    });

    it('should return meme facade contract', () => {
      expect(launchpad.memefacadeContract).toBe(wallet.contracts.memeFacade);
    });

    it('should return fto factory contract', () => {
      expect(launchpad.ftofactoryContract).toBe(wallet.contracts.ftofactory);
    });

    it('should return fto facade contract', () => {
      expect(launchpad.ftofacadeContract).toBe(wallet.contracts.ftofacade);
    });
  });

  describe('Factory Contract Methods', () => {
    it('should get all pairs length', async () => {
      const mockLength = BigInt(10);
      wallet.contracts.ftofactory.allPairsLength.call.mockResolvedValue(
        mockLength
      );

      const result = await launchpad.allPairsLength();

      expect(result).toBe(mockLength);
      expect(
        wallet.contracts.ftofactory.allPairsLength.call
      ).toHaveBeenCalled();
    });

    it('should get pair address by index', async () => {
      const mockAddress = '0xpairaddress';
      const index = BigInt(5);
      wallet.contracts.ftofactory.allPairs.call.mockResolvedValue(mockAddress);

      const result = await launchpad.getPairAddress(index);

      expect(result).toBe(mockAddress);
      expect(wallet.contracts.ftofactory.allPairs.call).toHaveBeenCalledWith([
        index,
      ]);
    });
  });

  describe('Create Launch Project - Meme Type', () => {
    const mockMemeParams = {
      launchType: 'meme' as const,
      provider: '0xprovider',
      raisedToken: '0xhoney',
      tokenName: 'Test Meme',
      tokenSymbol: 'TME',
      tokenAmount: 1000000,
      poolHandler: '0xhandler',
      raisingCycle: 1640995200,
      description: 'Test description',
      twitter: 'https://twitter.com/test',
      website: 'https://test.com',
      telegram: 'https://t.me/test',
      logoUrl: '/logo.png',
      bannerUrl: '/banner.png',
    };

    it('should simulate transaction before execution', async () => {
      const mockSimulateResult = { result: 'success' };
      wallet.contracts.memeFactory.contract.simulate.createPair.mockResolvedValue(
        mockSimulateResult
      );

      const mockTransactionResult = {
        logs: [{ address: '0xpairaddress' }],
      };
      wallet.contracts.memeFactory.createPair.call.mockResolvedValue(
        mockTransactionResult
      );

      const { parseEventLogs } = require('viem');
      parseEventLogs.mockReturnValue([{ args: { to: '0xlaunchedtoken' } }]);

      const { trpcClient } = require('../../../lib/trpc');
      trpcClient.projects.createProject.mutate.mockResolvedValue({});

      const result = await launchpad.createLaunchProject.call(mockMemeParams);

      expect(
        wallet.contracts.memeFactory.contract.simulate.createPair
      ).toHaveBeenCalledWith(
        [
          {
            raisedToken: '0xhoney',
            name: 'Test Meme',
            symbol: 'TME',
            swapHandler: '0xpositionmanager',
          },
        ],
        {
          account: wallet.account,
        }
      );

      expect(result).toBe('0xlaunchedtoken');
    });

    it('should throw error if simulation fails', async () => {
      const simulationError = new Error('Simulation failed');
      wallet.contracts.memeFactory.contract.simulate.createPair.mockRejectedValue(
        simulationError
      );

      await expect(
        launchpad.createLaunchProject.call(mockMemeParams)
      ).rejects.toThrow('Transaction simulation failed: Simulation failed');

      expect(
        wallet.contracts.memeFactory.createPair.call
      ).not.toHaveBeenCalled();
    });

    it('should execute transaction after successful simulation', async () => {
      wallet.contracts.memeFactory.contract.simulate.createPair.mockResolvedValue(
        {}
      );

      const mockTransactionResult = {
        logs: [{ address: '0xpairaddress' }],
      };
      wallet.contracts.memeFactory.createPair.call.mockResolvedValue(
        mockTransactionResult
      );

      const { parseEventLogs } = require('viem');
      parseEventLogs.mockReturnValue([{ args: { to: '0xlaunchedtoken' } }]);

      const { trpcClient } = require('../../../lib/trpc');
      trpcClient.projects.createProject.mutate.mockResolvedValue({});

      await launchpad.createLaunchProject.call(mockMemeParams);

      expect(wallet.contracts.memeFactory.createPair.call).toHaveBeenCalledWith(
        [
          {
            raisedToken: '0xhoney',
            name: 'Test Meme',
            symbol: 'TME',
            swapHandler: '0xpositionmanager',
          },
        ]
      );
    });

    it('should create project in database after successful deployment', async () => {
      wallet.contracts.memeFactory.contract.simulate.createPair.mockResolvedValue(
        {}
      );

      const mockTransactionResult = {
        logs: [{ address: '0xpairaddress' }],
      };
      wallet.contracts.memeFactory.createPair.call.mockResolvedValue(
        mockTransactionResult
      );

      const { parseEventLogs } = require('viem');
      parseEventLogs.mockReturnValue([{ args: { to: '0xlaunchedtoken' } }]);

      const { trpcClient } = require('../../../lib/trpc');
      trpcClient.projects.createProject.mutate.mockResolvedValue({});

      await launchpad.createLaunchProject.call(mockMemeParams);

      expect(trpcClient.projects.createProject.mutate).toHaveBeenCalledWith({
        pair: '0xlaunchedtoken',
        chain_id: 80084,
        provider: '0xprovider',
        project_type: 'meme',
        projectName: 'Test Meme',
        project_logo: '/logo.png',
        banner_url: '/banner.png',
        description: 'Test description',
        twitter: 'https://twitter.com/test',
        website: 'https://test.com',
        telegram: 'https://t.me/test',
      });
    });

    it('should use random default logo when none provided', async () => {
      const paramsWithoutLogo = { ...mockMemeParams, logoUrl: '' };

      wallet.contracts.memeFactory.contract.simulate.createPair.mockResolvedValue(
        {}
      );
      wallet.contracts.memeFactory.createPair.call.mockResolvedValue({
        logs: [{ address: '0xpairaddress' }],
      });

      const { parseEventLogs } = require('viem');
      parseEventLogs.mockReturnValue([{ args: { to: '0xlaunchedtoken' } }]);

      const { trpcClient } = require('../../../lib/trpc');
      trpcClient.projects.createProject.mutate.mockResolvedValue({});

      await launchpad.createLaunchProject.call(paramsWithoutLogo);

      expect(trpcClient.projects.createProject.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          project_logo: expect.stringMatching(
            /\/images\/default-project-icons\/[1-5]\.png/
          ),
        })
      );
    });
  });

  describe('Create Launch Project - FTO Type', () => {
    const mockFtoParams = {
      launchType: 'fto' as const,
      provider: '0xprovider',
      raisedToken: '0xhoney',
      tokenName: 'Test FTO',
      tokenSymbol: 'TFT',
      tokenAmount: 1000000,
      poolHandler: '0xhandler',
      raisingCycle: 1640995200,
      description: 'Test description',
      twitter: 'https://twitter.com/test',
      website: 'https://test.com',
      telegram: 'https://t.me/test',
      logoUrl: '/logo.png',
      bannerUrl: '/banner.png',
    };

    it('should simulate FTO transaction before execution', async () => {
      wallet.contracts.ftofactory.contract.simulate.createFTO.mockResolvedValue(
        {}
      );

      const mockTransactionResult = {
        logs: [{ address: '0xftopair' }],
      };
      wallet.contracts.ftofactory.createFTO.call.mockResolvedValue(
        mockTransactionResult
      );

      const { parseEventLogs } = require('viem');
      parseEventLogs.mockReturnValue([]);

      const { trpcClient } = require('../../../lib/trpc');
      trpcClient.projects.createProject.mutate.mockResolvedValue({});

      const result = await launchpad.createLaunchProject.call(mockFtoParams);

      expect(
        wallet.contracts.ftofactory.contract.simulate.createFTO
      ).toHaveBeenCalledWith(
        [
          '0xprovider',
          '0xhoney',
          'Test FTO',
          'TFT',
          BigInt(new BigNumber(1000000).multipliedBy(1e18).toFixed()),
          '0xrouter',
          BigInt(1640995200),
        ],
        {
          account: wallet.account,
        }
      );

      expect(result).toBe('0xftopair');
    });

    it('should execute FTO transaction after successful simulation', async () => {
      wallet.contracts.ftofactory.contract.simulate.createFTO.mockResolvedValue(
        {}
      );

      const mockTransactionResult = {
        logs: [{ address: '0xftopair' }],
      };
      wallet.contracts.ftofactory.createFTO.call.mockResolvedValue(
        mockTransactionResult
      );

      const { parseEventLogs } = require('viem');
      parseEventLogs.mockReturnValue([]);

      const { trpcClient } = require('../../../lib/trpc');
      trpcClient.projects.createProject.mutate.mockResolvedValue({});

      await launchpad.createLaunchProject.call(mockFtoParams);

      expect(wallet.contracts.ftofactory.createFTO.call).toHaveBeenCalledWith([
        '0xprovider',
        '0xhoney',
        'Test FTO',
        'TFT',
        BigInt(new BigNumber(1000000).multipliedBy(1e18).toFixed()),
        '0xrouter',
        BigInt(1640995200),
      ]);
    });
  });

  describe('Update Project', () => {
    const mockUpdateData = {
      pair: '0xpair',
      chain_id: 80084,
      twitter: 'https://twitter.com/updated',
      telegram: 'https://t.me/updated',
      website: 'https://updated.com',
      description: 'Updated description',
      projectName: 'Updated Name',
    };

    it('should create SIWE message before updating', async () => {
      const {
        createSiweMessage,
      } = require('../../../lib/siwe');
      const { trpcClient } = require('../../../lib/trpc');

      createSiweMessage.mockResolvedValue({});
      trpcClient.projects.createOrUpdateProjectInfo.mutate.mockResolvedValue(
        {}
      );

      await launchpad.updateProject.call(mockUpdateData);

      expect(createSiweMessage).toHaveBeenCalledWith(
        wallet.account,
        'Sign In With Honeypot',
        wallet.walletClient
      );
    });

    it('should call update project API', async () => {
      const {
        createSiweMessage,
      } = require('../../../lib/siwe');
      const { trpcClient } = require('../../../lib/trpc');

      createSiweMessage.mockResolvedValue({});
      trpcClient.projects.createOrUpdateProjectInfo.mutate.mockResolvedValue(
        {}
      );

      await launchpad.updateProject.call(mockUpdateData);

      expect(
        trpcClient.projects.createOrUpdateProjectInfo.mutate
      ).toHaveBeenCalledWith(mockUpdateData);
    });
  });

  describe('Update Project Logo', () => {
    const mockLogoData = {
      logo_url: '/new-logo.png',
      pair: '0xpair',
      chain_id: 80084,
    };

    it('should update project logo with SIWE authentication', async () => {
      const {
        createSiweMessage,
      } = require('../../../lib/siwe');
      const { trpcClient } = require('../../../lib/trpc');

      createSiweMessage.mockResolvedValue({});
      trpcClient.projects.updateProjectLogo.mutate.mockResolvedValue({});

      await launchpad.updateProjectLogo.call(mockLogoData);

      expect(createSiweMessage).toHaveBeenCalled();
      expect(trpcClient.projects.updateProjectLogo.mutate).toHaveBeenCalledWith(
        mockLogoData
      );
    });
  });

  describe('Update Project Banner', () => {
    const mockBannerData = {
      banner_url: '/new-banner.png',
      pair: '0xpair',
      chain_id: 80084,
    };

    it('should update project banner with SIWE authentication', async () => {
      const {
        createSiweMessage,
      } = require('../../../lib/siwe');
      const { trpcClient } = require('../../../lib/trpc');

      createSiweMessage.mockResolvedValue({});
      trpcClient.projects.updateProjectBanner.mutate.mockResolvedValue({});

      await launchpad.updateProjectBanner.call(mockBannerData);

      expect(createSiweMessage).toHaveBeenCalled();
      expect(
        trpcClient.projects.updateProjectBanner.mutate
      ).toHaveBeenCalledWith(mockBannerData);
    });
  });

  describe('Utility Methods', () => {
    it('should check if token is raise token', () => {
      const result1 = launchpad.isRaiseToken('0xhoney');
      const result2 = launchpad.isRaiseToken('0xother');

      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should handle case insensitive token address comparison', () => {
      const result = launchpad.isRaiseToken('0xHONEY');

      expect(result).toBe(true);
    });

    it('should set current launchpad type', () => {
      launchpad.setCurrentLaunchpadType('fto');

      expect(launchpad.currentLaunchpadType.value).toBe('fto');
    });
  });

  describe('Error Handling', () => {
    it('should handle simulation errors with detailed messages', async () => {
      const detailedError = {
        shortMessage: 'Insufficient balance',
        message: 'Transaction would fail due to insufficient balance',
        cause: 'InsufficientFunds',
      };

      wallet.contracts.memeFactory.contract.simulate.createPair.mockRejectedValue(
        detailedError
      );

      await expect(
        launchpad.createLaunchProject.call({
          launchType: 'meme',
          provider: '0xprovider',
          raisedToken: '0xhoney',
          tokenName: 'Test',
          tokenSymbol: 'TST',
          tokenAmount: 1000000,
          poolHandler: '0xhandler',
          raisingCycle: 1640995200,
          description: '',
          twitter: '',
          website: '',
          telegram: '',
          logoUrl: '',
          bannerUrl: '',
        })
      ).rejects.toThrow('Transaction simulation failed: Insufficient balance');
    });

    it('should handle transaction execution errors', async () => {
      wallet.contracts.memeFactory.contract.simulate.createPair.mockResolvedValue(
        {}
      );
      wallet.contracts.memeFactory.createPair.call.mockRejectedValue(
        new Error('Transaction failed')
      );

      await expect(
        launchpad.createLaunchProject.call({
          launchType: 'meme',
          provider: '0xprovider',
          raisedToken: '0xhoney',
          tokenName: 'Test',
          tokenSymbol: 'TST',
          tokenAmount: 1000000,
          poolHandler: '0xhandler',
          raisingCycle: 1640995200,
          description: '',
          twitter: '',
          website: '',
          telegram: '',
          logoUrl: '',
          bannerUrl: '',
        })
      ).rejects.toThrow('Transaction failed');
    });

    it('should handle database creation errors', async () => {
      wallet.contracts.memeFactory.contract.simulate.createPair.mockResolvedValue(
        {}
      );
      wallet.contracts.memeFactory.createPair.call.mockResolvedValue({
        logs: [{ address: '0xpairaddress' }],
      });

      const { parseEventLogs } = require('viem');
      parseEventLogs.mockReturnValue([{ args: { to: '0xlaunchedtoken' } }]);

      const { trpcClient } = require('../../../lib/trpc');
      trpcClient.projects.createProject.mutate.mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        launchpad.createLaunchProject.call({
          launchType: 'meme',
          provider: '0xprovider',
          raisedToken: '0xhoney',
          tokenName: 'Test',
          tokenSymbol: 'TST',
          tokenAmount: 1000000,
          poolHandler: '0xhandler',
          raisingCycle: 1640995200,
          description: '',
          twitter: '',
          website: '',
          telegram: '',
          logoUrl: '',
          bannerUrl: '',
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('Loading States', () => {
    it('should have initial loading state as false', () => {
      expect(launchpad.createLaunchProject.loading).toBe(false);
      expect(launchpad.updateProject.loading).toBe(false);
      expect(launchpad.updateProjectLogo.loading).toBe(false);
      expect(launchpad.updateProjectBanner.loading).toBe(false);
    });
  });
});
