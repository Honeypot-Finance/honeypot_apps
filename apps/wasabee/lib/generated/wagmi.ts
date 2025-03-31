import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgebraBasePlugin
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const algebraBasePluginAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_pool', internalType: 'address', type: 'address' },
      { name: '_factory', internalType: 'address', type: 'address' },
      { name: '_pluginFactory', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'targetIsTooOld' },
  { type: 'error', inputs: [], name: 'tickOutOfRange' },
  { type: 'error', inputs: [], name: 'transferFailed' },
  { type: 'error', inputs: [], name: 'volatilityOracleAlreadyInitialized' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'baseFee',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'BaseFee',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newIncentive',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Incentive',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'priceChangeFactor',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PriceChangeFactor',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ALGEBRA_BASE_PLUGIN_MANAGER',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'afterFlash',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint160', type: 'uint160' },
      { name: 'tick', internalType: 'int24', type: 'int24' },
    ],
    name: 'afterInitialize',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'int24', type: 'int24' },
      { name: '', internalType: 'int24', type: 'int24' },
      { name: '', internalType: 'int128', type: 'int128' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'afterModifyPosition',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: 'zeroToOne', internalType: 'bool', type: 'bool' },
      { name: '', internalType: 'int256', type: 'int256' },
      { name: '', internalType: 'uint160', type: 'uint160' },
      { name: '', internalType: 'int256', type: 'int256' },
      { name: '', internalType: 'int256', type: 'int256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'afterSwap',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'beforeFlash',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint160', type: 'uint160' },
    ],
    name: 'beforeInitialize',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'int24', type: 'int24' },
      { name: '', internalType: 'int24', type: 'int24' },
      { name: '', internalType: 'int128', type: 'int128' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'beforeModifyPosition',
    outputs: [
      { name: '', internalType: 'bytes4', type: 'bytes4' },
      { name: '', internalType: 'uint24', type: 'uint24' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: 'zeroToOne', internalType: 'bool', type: 'bool' },
      { name: '', internalType: 'int256', type: 'int256' },
      { name: '', internalType: 'uint160', type: 'uint160' },
      { name: '', internalType: 'bool', type: 'bool' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'beforeSwap',
    outputs: [
      { name: '', internalType: 'bytes4', type: 'bytes4' },
      { name: '', internalType: 'uint24', type: 'uint24' },
      { name: '', internalType: 'uint24', type: 'uint24' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'collectPluginFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultPluginConfig',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentFee',
    outputs: [{ name: 'fee', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPool',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'secondsAgo', internalType: 'uint32', type: 'uint32' }],
    name: 'getSingleTimepoint',
    outputs: [
      { name: 'tickCumulative', internalType: 'int56', type: 'int56' },
      { name: 'volatilityCumulative', internalType: 'uint88', type: 'uint88' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'secondsAgos', internalType: 'uint32[]', type: 'uint32[]' },
    ],
    name: 'getTimepoints',
    outputs: [
      { name: 'tickCumulatives', internalType: 'int56[]', type: 'int56[]' },
      {
        name: 'volatilityCumulatives',
        internalType: 'uint88[]',
        type: 'uint88[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'handlePluginFee',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'incentive',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targetIncentive', internalType: 'address', type: 'address' },
    ],
    name: 'isIncentiveConnected',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isInitialized',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastTimepointTimestamp',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pool',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'startIndex', internalType: 'uint16', type: 'uint16' },
      { name: 'amount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'prepayTimepointsStorageSlots',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 's_baseFee',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 's_feeFactors',
    outputs: [
      { name: 'zeroToOneFeeFactor', internalType: 'uint128', type: 'uint128' },
      { name: 'oneToZeroFeeFactor', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 's_priceChangeFactor',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newBaseFee', internalType: 'uint16', type: 'uint16' }],
    name: 'setBaseFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newIncentive', internalType: 'address', type: 'address' },
    ],
    name: 'setIncentive',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newPriceChangeFactor', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'setPriceChangeFactor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'timepointIndex',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'timepoints',
    outputs: [
      { name: 'initialized', internalType: 'bool', type: 'bool' },
      { name: 'blockTimestamp', internalType: 'uint32', type: 'uint32' },
      { name: 'tickCumulative', internalType: 'int56', type: 'int56' },
      { name: 'volatilityCumulative', internalType: 'uint88', type: 'uint88' },
      { name: 'tick', internalType: 'int24', type: 'int24' },
      { name: 'averageTick', internalType: 'int24', type: 'int24' },
      { name: 'windowStartIndex', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgebraEternalFarming
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const algebraEternalFarmingAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_deployer',
        internalType: 'contract IAlgebraPoolDeployer',
        type: 'address',
      },
      {
        name: '_nonfungiblePositionManager',
        internalType: 'contract INonfungiblePositionManager',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'anotherFarmingIsActive' },
  { type: 'error', inputs: [], name: 'claimToZeroAddress' },
  { type: 'error', inputs: [], name: 'emergencyActivated' },
  { type: 'error', inputs: [], name: 'farmDoesNotExist' },
  { type: 'error', inputs: [], name: 'incentiveNotExist' },
  { type: 'error', inputs: [], name: 'incentiveStopped' },
  { type: 'error', inputs: [], name: 'invalidPool' },
  { type: 'error', inputs: [], name: 'invalidTokenAmount' },
  { type: 'error', inputs: [], name: 'minimalPositionWidthTooWide' },
  { type: 'error', inputs: [], name: 'pluginNotConnected' },
  { type: 'error', inputs: [], name: 'poolReentrancyLock' },
  { type: 'error', inputs: [], name: 'positionIsTooNarrow' },
  { type: 'error', inputs: [], name: 'reentrancyLock' },
  { type: 'error', inputs: [], name: 'tokenAlreadyFarmed' },
  { type: 'error', inputs: [], name: 'zeroLiquidity' },
  { type: 'error', inputs: [], name: 'zeroRewardAmount' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'newStatus', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'EmergencyWithdraw',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'rewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
        indexed: true,
      },
      {
        name: 'bonusRewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pool',
        internalType: 'contract IAlgebraPool',
        type: 'address',
        indexed: true,
      },
      {
        name: 'virtualPool',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'nonce',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'reward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bonusReward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'minimalAllowedPositionWidth',
        internalType: 'uint24',
        type: 'uint24',
        indexed: false,
      },
    ],
    name: 'EternalFarmingCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'incentiveId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'rewardAddress',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'bonusRewardToken',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'reward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bonusReward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FarmEnded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'incentiveId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'liquidity',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
    ],
    name: 'FarmEntered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'farmingCenter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'FarmingCenter',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'incentiveId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'IncentiveDeactivated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'rewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bonusRewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'incentiveId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'RewardAmountsDecreased',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'reward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'rewardAddress',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RewardClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'rewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bonusRewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'incentiveId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'RewardsAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'incentiveId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'rewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bonusRewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RewardsCollected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'rewardRate',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'bonusRewardRate',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'incentiveId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'RewardsRatesChanged',
  },
  {
    type: 'function',
    inputs: [],
    name: 'FARMINGS_ADMINISTRATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'INCENTIVE_MAKER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'rewardAmount', internalType: 'uint128', type: 'uint128' },
      { name: 'bonusRewardAmount', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'addRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
      },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amountRequested', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimReward',
    outputs: [{ name: 'reward', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
      },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amountRequested', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimRewardFrom',
    outputs: [{ name: 'reward', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_owner', internalType: 'address', type: 'address' },
    ],
    name: 'collectRewards',
    outputs: [
      { name: 'reward', internalType: 'uint256', type: 'uint256' },
      { name: 'bonusReward', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: 'params',
        internalType: 'struct IAlgebraEternalFarming.IncentiveParams',
        type: 'tuple',
        components: [
          { name: 'reward', internalType: 'uint128', type: 'uint128' },
          { name: 'bonusReward', internalType: 'uint128', type: 'uint128' },
          { name: 'rewardRate', internalType: 'uint128', type: 'uint128' },
          { name: 'bonusRewardRate', internalType: 'uint128', type: 'uint128' },
          {
            name: 'minimalPositionWidth',
            internalType: 'uint24',
            type: 'uint24',
          },
        ],
      },
      { name: 'plugin', internalType: 'address', type: 'address' },
    ],
    name: 'createEternalFarming',
    outputs: [
      { name: 'virtualPool', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'deactivateIncentive',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'rewardAmount', internalType: 'uint128', type: 'uint128' },
      { name: 'bonusRewardAmount', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'decreaseRewardsAmount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'enterFarming',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_owner', internalType: 'address', type: 'address' },
    ],
    name: 'exitFarming',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'farmingCenter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'incentiveId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'farms',
    outputs: [
      { name: 'liquidity', internalType: 'uint128', type: 'uint128' },
      { name: 'tickLower', internalType: 'int24', type: 'int24' },
      { name: 'tickUpper', internalType: 'int24', type: 'int24' },
      { name: 'innerRewardGrowth0', internalType: 'uint256', type: 'uint256' },
      { name: 'innerRewardGrowth1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getRewardInfo',
    outputs: [
      { name: 'reward', internalType: 'uint256', type: 'uint256' },
      { name: 'bonusReward', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'incentiveId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'incentives',
    outputs: [
      { name: 'totalReward', internalType: 'uint128', type: 'uint128' },
      { name: 'bonusReward', internalType: 'uint128', type: 'uint128' },
      { name: 'virtualPoolAddress', internalType: 'address', type: 'address' },
      { name: 'minimalPositionWidth', internalType: 'uint24', type: 'uint24' },
      { name: 'deactivated', internalType: 'bool', type: 'bool' },
      { name: 'pluginAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isEmergencyWithdrawActivated',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'incentiveId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isIncentiveDeactivated',
    outputs: [{ name: 'res', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nonfungiblePositionManager',
    outputs: [
      {
        name: '',
        internalType: 'contract INonfungiblePositionManager',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'numOfIncentives',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      {
        name: 'rewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
      },
    ],
    name: 'rewards',
    outputs: [
      { name: 'rewardAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newStatus', internalType: 'bool', type: 'bool' }],
    name: 'setEmergencyWithdrawStatus',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_farmingCenter', internalType: 'address', type: 'address' },
    ],
    name: 'setFarmingCenterAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'rewardRate', internalType: 'uint128', type: 'uint128' },
      { name: 'bonusRewardRate', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'setRates',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const algebraEternalFarmingAddress = {
  80069: '0x0000000000000000000000000000000000000000',
  80094: '0x8554797BaE76Afe81dD5375111A2f3b0414D3B02',
  default: '0x0000000000000000000000000000000000000000',
} as const

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const algebraEternalFarmingConfig = {
  address: algebraEternalFarmingAddress,
  abi: algebraEternalFarmingAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgebraFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const algebraFactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_poolDeployer', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'deployer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token0',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token1',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pool',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'CustomPool',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newDefaultCommunityFee',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'DefaultCommunityFee',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newDefaultFee',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'DefaultFee',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'defaultPluginFactoryAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'DefaultPluginFactory',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newDefaultTickspacing',
        internalType: 'int24',
        type: 'int24',
        indexed: false,
      },
    ],
    name: 'DefaultTickspacing',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferStarted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token0',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token1',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pool',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Pool',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RenounceOwnershipFinish',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'finishTimestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RenounceOwnershipStart',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RenounceOwnershipStop',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newVaultFactory',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'VaultFactory',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CUSTOM_POOL_DEPLOYER',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'POOLS_ADMINISTRATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'POOL_INIT_CODE_HASH',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'deployer', internalType: 'address', type: 'address' },
      { name: 'token0', internalType: 'address', type: 'address' },
      { name: 'token1', internalType: 'address', type: 'address' },
    ],
    name: 'computeCustomPoolAddress',
    outputs: [{ name: 'customPool', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token0', internalType: 'address', type: 'address' },
      { name: 'token1', internalType: 'address', type: 'address' },
    ],
    name: 'computePoolAddress',
    outputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'deployer', internalType: 'address', type: 'address' },
      { name: 'creator', internalType: 'address', type: 'address' },
      { name: 'tokenA', internalType: 'address', type: 'address' },
      { name: 'tokenB', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'createCustomPool',
    outputs: [{ name: 'customPool', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenA', internalType: 'address', type: 'address' },
      { name: 'tokenB', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'createPool',
    outputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'customPoolByPair',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultCommunityFee',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultConfigurationForPool',
    outputs: [
      { name: 'communityFee', internalType: 'uint16', type: 'uint16' },
      { name: 'tickSpacing', internalType: 'int24', type: 'int24' },
      { name: 'fee', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultFee',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultPluginFactory',
    outputs: [
      {
        name: '',
        internalType: 'contract IAlgebraPluginFactory',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultTickspacing',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getRoleMember',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleMemberCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRoleOrOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'poolByPair',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'poolDeployer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnershipStartTimestamp',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newDefaultCommunityFee',
        internalType: 'uint16',
        type: 'uint16',
      },
    ],
    name: 'setDefaultCommunityFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newDefaultFee', internalType: 'uint16', type: 'uint16' }],
    name: 'setDefaultFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newDefaultPluginFactory',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'setDefaultPluginFactory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newDefaultTickspacing', internalType: 'int24', type: 'int24' },
    ],
    name: 'setDefaultTickspacing',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newVaultFactory', internalType: 'address', type: 'address' },
    ],
    name: 'setVaultFactory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'startRenounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'stopRenounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'vaultFactory',
    outputs: [
      {
        name: '',
        internalType: 'contract IAlgebraVaultFactory',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
] as const

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const algebraFactoryAddress = {
  80069: '0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d',
  80094: '0x7d53327D78EFD0b463bd8d7dc938C52402323b95',
  default: '0x0000000000000000000000000000000000000000',
} as const

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const algebraFactoryConfig = {
  address: algebraFactoryAddress,
  abi: algebraFactoryAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgebraPool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const algebraPoolAbi = [
  { type: 'error', inputs: [], name: 'alreadyInitialized' },
  { type: 'error', inputs: [], name: 'arithmeticError' },
  { type: 'error', inputs: [], name: 'bottomTickLowerThanMIN' },
  { type: 'error', inputs: [], name: 'dynamicFeeActive' },
  { type: 'error', inputs: [], name: 'dynamicFeeDisabled' },
  { type: 'error', inputs: [], name: 'flashInsufficientPaid0' },
  { type: 'error', inputs: [], name: 'flashInsufficientPaid1' },
  { type: 'error', inputs: [], name: 'insufficientInputAmount' },
  { type: 'error', inputs: [], name: 'invalidAmountRequired' },
  {
    type: 'error',
    inputs: [{ name: 'selector', internalType: 'bytes4', type: 'bytes4' }],
    name: 'invalidHookResponse',
  },
  { type: 'error', inputs: [], name: 'invalidLimitSqrtPrice' },
  { type: 'error', inputs: [], name: 'invalidNewCommunityFee' },
  { type: 'error', inputs: [], name: 'invalidNewTickSpacing' },
  { type: 'error', inputs: [], name: 'liquidityAdd' },
  { type: 'error', inputs: [], name: 'liquidityOverflow' },
  { type: 'error', inputs: [], name: 'liquiditySub' },
  { type: 'error', inputs: [], name: 'locked' },
  { type: 'error', inputs: [], name: 'notAllowed' },
  { type: 'error', inputs: [], name: 'notInitialized' },
  { type: 'error', inputs: [], name: 'onlyFarming' },
  { type: 'error', inputs: [], name: 'pluginIsNotConnected' },
  { type: 'error', inputs: [], name: 'priceOutOfRange' },
  { type: 'error', inputs: [], name: 'tickInvalidLinks' },
  { type: 'error', inputs: [], name: 'tickIsNotInitialized' },
  { type: 'error', inputs: [], name: 'tickIsNotSpaced' },
  { type: 'error', inputs: [], name: 'tickOutOfRange' },
  { type: 'error', inputs: [], name: 'topTickAboveMAX' },
  { type: 'error', inputs: [], name: 'topTickLowerOrEqBottomTick' },
  { type: 'error', inputs: [], name: 'transferFailed' },
  { type: 'error', inputs: [], name: 'zeroAmountRequired' },
  { type: 'error', inputs: [], name: 'zeroLiquidityActual' },
  { type: 'error', inputs: [], name: 'zeroLiquidityDesired' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'bottomTick',
        internalType: 'int24',
        type: 'int24',
        indexed: true,
      },
      { name: 'topTick', internalType: 'int24', type: 'int24', indexed: true },
      {
        name: 'liquidityAmount',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Burn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'recipient',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'bottomTick',
        internalType: 'int24',
        type: 'int24',
        indexed: true,
      },
      { name: 'topTick', internalType: 'int24', type: 'int24', indexed: true },
      {
        name: 'amount0',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
    ],
    name: 'Collect',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'communityFeeNew',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'CommunityFee',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'fee', internalType: 'uint16', type: 'uint16', indexed: false },
    ],
    name: 'Fee',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'recipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'paid0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'paid1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Flash',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'price',
        internalType: 'uint160',
        type: 'uint160',
        indexed: false,
      },
      { name: 'tick', internalType: 'int24', type: 'int24', indexed: false },
    ],
    name: 'Initialize',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'bottomTick',
        internalType: 'int24',
        type: 'int24',
        indexed: true,
      },
      { name: 'topTick', internalType: 'int24', type: 'int24', indexed: true },
      {
        name: 'liquidityAmount',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Mint',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newPluginAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Plugin',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newPluginConfig',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'PluginConfig',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'recipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount0',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
      {
        name: 'price',
        internalType: 'uint160',
        type: 'uint160',
        indexed: false,
      },
      {
        name: 'liquidity',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      { name: 'tick', internalType: 'int24', type: 'int24', indexed: false },
    ],
    name: 'Swap',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newTickSpacing',
        internalType: 'int24',
        type: 'int24',
        indexed: false,
      },
    ],
    name: 'TickSpacing',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bottomTick', internalType: 'int24', type: 'int24' },
      { name: 'topTick', internalType: 'int24', type: 'int24' },
      { name: 'amount', internalType: 'uint128', type: 'uint128' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'burn',
    outputs: [
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'bottomTick', internalType: 'int24', type: 'int24' },
      { name: 'topTick', internalType: 'int24', type: 'int24' },
      { name: 'amount0Requested', internalType: 'uint128', type: 'uint128' },
      { name: 'amount1Requested', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'collect',
    outputs: [
      { name: 'amount0', internalType: 'uint128', type: 'uint128' },
      { name: 'amount1', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'communityFeeLastTimestamp',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'communityVault',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'factory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'fee',
    outputs: [{ name: 'currentFee', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'flash',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCommunityFeePending',
    outputs: [
      { name: '', internalType: 'uint128', type: 'uint128' },
      { name: '', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getReserves',
    outputs: [
      { name: '', internalType: 'uint128', type: 'uint128' },
      { name: '', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'globalState',
    outputs: [
      { name: 'price', internalType: 'uint160', type: 'uint160' },
      { name: 'tick', internalType: 'int24', type: 'int24' },
      { name: 'fee', internalType: 'uint16', type: 'uint16' },
      { name: 'pluginConfig', internalType: 'uint8', type: 'uint8' },
      { name: 'communityFee', internalType: 'uint16', type: 'uint16' },
      { name: 'unlocked', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'initialPrice', internalType: 'uint160', type: 'uint160' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'liquidity',
    outputs: [{ name: '', internalType: 'uint128', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxLiquidityPerTick',
    outputs: [{ name: '', internalType: 'uint128', type: 'uint128' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'leftoversRecipient', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'bottomTick', internalType: 'int24', type: 'int24' },
      { name: 'topTick', internalType: 'int24', type: 'int24' },
      { name: 'liquidityDesired', internalType: 'uint128', type: 'uint128' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'mint',
    outputs: [
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
      { name: 'liquidityActual', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextTickGlobal',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'plugin',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'positions',
    outputs: [
      { name: 'liquidity', internalType: 'uint256', type: 'uint256' },
      {
        name: 'innerFeeGrowth0Token',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'innerFeeGrowth1Token',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'fees0', internalType: 'uint128', type: 'uint128' },
      { name: 'fees1', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'prevTickGlobal',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newCommunityFee', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'setCommunityFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newFee', internalType: 'uint16', type: 'uint16' }],
    name: 'setFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newPluginAddress', internalType: 'address', type: 'address' },
    ],
    name: 'setPlugin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newConfig', internalType: 'uint8', type: 'uint8' }],
    name: 'setPluginConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newTickSpacing', internalType: 'int24', type: 'int24' }],
    name: 'setTickSpacing',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'zeroToOne', internalType: 'bool', type: 'bool' },
      { name: 'amountRequired', internalType: 'int256', type: 'int256' },
      { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'swap',
    outputs: [
      { name: 'amount0', internalType: 'int256', type: 'int256' },
      { name: 'amount1', internalType: 'int256', type: 'int256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'leftoversRecipient', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'zeroToOne', internalType: 'bool', type: 'bool' },
      { name: 'amountToSell', internalType: 'int256', type: 'int256' },
      { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'swapWithPaymentInAdvance',
    outputs: [
      { name: 'amount0', internalType: 'int256', type: 'int256' },
      { name: 'amount1', internalType: 'int256', type: 'int256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tickSpacing',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'int16', type: 'int16' }],
    name: 'tickTable',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    name: 'ticks',
    outputs: [
      { name: 'liquidityTotal', internalType: 'uint256', type: 'uint256' },
      { name: 'liquidityDelta', internalType: 'int128', type: 'int128' },
      { name: 'prevTick', internalType: 'int24', type: 'int24' },
      { name: 'nextTick', internalType: 'int24', type: 'int24' },
      {
        name: 'outerFeeGrowth0Token',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'outerFeeGrowth1Token',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token0',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token1',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalFeeGrowth0Token',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalFeeGrowth1Token',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgebraPositionManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const algebraPositionManagerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_factory', internalType: 'address', type: 'address' },
      { name: '_WNativeToken', internalType: 'address', type: 'address' },
      { name: '_tokenDescriptor_', internalType: 'address', type: 'address' },
      { name: '_poolDeployer', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'tickOutOfRange' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'recipient',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Collect',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'liquidity',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DecreaseLiquidity',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'FarmingFailed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'liquidityDesired',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'actualLiquidity',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'pool',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'IncreaseLiquidity',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'NONFUNGIBLE_POSITION_MANAGER_ADMINISTRATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PERMIT_TYPEHASH',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'WNativeToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount0Owed', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1Owed', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'algebraMintCallback',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'approve', internalType: 'bool', type: 'bool' },
      { name: 'farmingAddress', internalType: 'address', type: 'address' },
    ],
    name: 'approveForFarming',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct INonfungiblePositionManager.CollectParams',
        type: 'tuple',
        components: [
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'amount0Max', internalType: 'uint128', type: 'uint128' },
          { name: 'amount1Max', internalType: 'uint128', type: 'uint128' },
        ],
      },
    ],
    name: 'collect',
    outputs: [
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token0', internalType: 'address', type: 'address' },
      { name: 'token1', internalType: 'address', type: 'address' },
      { name: 'deployer', internalType: 'address', type: 'address' },
      { name: 'sqrtPriceX96', internalType: 'uint160', type: 'uint160' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'createAndInitializePoolIfNecessary',
    outputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType:
          'struct INonfungiblePositionManager.DecreaseLiquidityParams',
        type: 'tuple',
        components: [
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'liquidity', internalType: 'uint128', type: 'uint128' },
          { name: 'amount0Min', internalType: 'uint256', type: 'uint256' },
          { name: 'amount1Min', internalType: 'uint256', type: 'uint256' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'decreaseLiquidity',
    outputs: [
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'factory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'farmingApprovals',
    outputs: [
      {
        name: 'farmingCenterAddress',
        internalType: 'address',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'farmingCenter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType:
          'struct INonfungiblePositionManager.IncreaseLiquidityParams',
        type: 'tuple',
        components: [
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'amount0Desired', internalType: 'uint256', type: 'uint256' },
          { name: 'amount1Desired', internalType: 'uint256', type: 'uint256' },
          { name: 'amount0Min', internalType: 'uint256', type: 'uint256' },
          { name: 'amount1Min', internalType: 'uint256', type: 'uint256' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'increaseLiquidity',
    outputs: [
      { name: 'liquidity', internalType: 'uint128', type: 'uint128' },
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isApprovedOrOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct INonfungiblePositionManager.MintParams',
        type: 'tuple',
        components: [
          { name: 'token0', internalType: 'address', type: 'address' },
          { name: 'token1', internalType: 'address', type: 'address' },
          { name: 'deployer', internalType: 'address', type: 'address' },
          { name: 'tickLower', internalType: 'int24', type: 'int24' },
          { name: 'tickUpper', internalType: 'int24', type: 'int24' },
          { name: 'amount0Desired', internalType: 'uint256', type: 'uint256' },
          { name: 'amount1Desired', internalType: 'uint256', type: 'uint256' },
          { name: 'amount0Min', internalType: 'uint256', type: 'uint256' },
          { name: 'amount1Min', internalType: 'uint256', type: 'uint256' },
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'mint',
    outputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'liquidity', internalType: 'uint128', type: 'uint128' },
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'data', internalType: 'bytes[]', type: 'bytes[]' }],
    name: 'multicall',
    outputs: [{ name: 'results', internalType: 'bytes[]', type: 'bytes[]' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'poolDeployer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'positions',
    outputs: [
      { name: 'nonce', internalType: 'uint88', type: 'uint88' },
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'token0', internalType: 'address', type: 'address' },
      { name: 'token1', internalType: 'address', type: 'address' },
      { name: 'deployer', internalType: 'address', type: 'address' },
      { name: 'tickLower', internalType: 'int24', type: 'int24' },
      { name: 'tickUpper', internalType: 'int24', type: 'int24' },
      { name: 'liquidity', internalType: 'uint128', type: 'uint128' },
      {
        name: 'feeGrowthInside0LastX128',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'feeGrowthInside1LastX128',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'tokensOwed0', internalType: 'uint128', type: 'uint128' },
      { name: 'tokensOwed1', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'refundNativeToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'expiry', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermitAllowed',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'expiry', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermitAllowedIfNecessary',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermitIfNecessary',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newFarmingCenter', internalType: 'address', type: 'address' },
    ],
    name: 'setFarmingCenter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amountMinimum', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'sweepToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'toActive', internalType: 'bool', type: 'bool' },
    ],
    name: 'switchFarmingStatus',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenFarmedIn',
    outputs: [
      {
        name: 'farmingCenterAddress',
        internalType: 'address',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amountMinimum', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'unwrapWNativeToken',
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const algebraPositionManagerAddress = {
  80069: '0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27',
  80094: '0xBB203aADbE36C125028a54584f5d48C1764317D0',
  default: '0x0000000000000000000000000000000000000000',
} as const

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const algebraPositionManagerConfig = {
  address: algebraPositionManagerAddress,
  abi: algebraPositionManagerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgebraQuoter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const algebraQuoterAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_factory', internalType: 'address', type: 'address' },
      { name: '_WNativeToken', internalType: 'address', type: 'address' },
      { name: '_poolDeployer', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'WNativeToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount0Delta', internalType: 'int256', type: 'int256' },
      { name: 'amount1Delta', internalType: 'int256', type: 'int256' },
      { name: 'path', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'algebraSwapCallback',
    outputs: [],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'factory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'poolDeployer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'path', internalType: 'bytes', type: 'bytes' },
      { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'quoteExactInput',
    outputs: [
      { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
      { name: 'fees', internalType: 'uint16[]', type: 'uint16[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenIn', internalType: 'address', type: 'address' },
      { name: 'tokenOut', internalType: 'address', type: 'address' },
      { name: 'deployer', internalType: 'address', type: 'address' },
      { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
      { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
    ],
    name: 'quoteExactInputSingle',
    outputs: [
      { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
      { name: 'fee', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'path', internalType: 'bytes', type: 'bytes' },
      { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'quoteExactOutput',
    outputs: [
      { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
      { name: 'fees', internalType: 'uint16[]', type: 'uint16[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenIn', internalType: 'address', type: 'address' },
      { name: 'tokenOut', internalType: 'address', type: 'address' },
      { name: 'deployer', internalType: 'address', type: 'address' },
      { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
      { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
    ],
    name: 'quoteExactOutputSingle',
    outputs: [
      { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
      { name: 'fee', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const algebraQuoterAddress = {
  80069: '0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545',
  80094: '0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73',
  default: '0x0000000000000000000000000000000000000000',
} as const

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const algebraQuoterConfig = {
  address: algebraQuoterAddress,
  abi: algebraQuoterAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgebraRouter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const algebraRouterAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_factory', internalType: 'address', type: 'address' },
      { name: '_WNativeToken', internalType: 'address', type: 'address' },
      { name: '_poolDeployer', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'WNativeToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount0Delta', internalType: 'int256', type: 'int256' },
      { name: 'amount1Delta', internalType: 'int256', type: 'int256' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'algebraSwapCallback',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct ISwapRouter.ExactInputParams',
        type: 'tuple',
        components: [
          { name: 'path', internalType: 'bytes', type: 'bytes' },
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
          {
            name: 'amountOutMinimum',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
    ],
    name: 'exactInput',
    outputs: [{ name: 'amountOut', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct ISwapRouter.ExactInputSingleParams',
        type: 'tuple',
        components: [
          { name: 'tokenIn', internalType: 'address', type: 'address' },
          { name: 'tokenOut', internalType: 'address', type: 'address' },
          { name: 'deployer', internalType: 'address', type: 'address' },
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
          {
            name: 'amountOutMinimum',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
        ],
      },
    ],
    name: 'exactInputSingle',
    outputs: [{ name: 'amountOut', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct ISwapRouter.ExactInputSingleParams',
        type: 'tuple',
        components: [
          { name: 'tokenIn', internalType: 'address', type: 'address' },
          { name: 'tokenOut', internalType: 'address', type: 'address' },
          { name: 'deployer', internalType: 'address', type: 'address' },
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
          {
            name: 'amountOutMinimum',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
        ],
      },
    ],
    name: 'exactInputSingleSupportingFeeOnTransferTokens',
    outputs: [{ name: 'amountOut', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct ISwapRouter.ExactOutputParams',
        type: 'tuple',
        components: [
          { name: 'path', internalType: 'bytes', type: 'bytes' },
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
          { name: 'amountInMaximum', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'exactOutput',
    outputs: [{ name: 'amountIn', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct ISwapRouter.ExactOutputSingleParams',
        type: 'tuple',
        components: [
          { name: 'tokenIn', internalType: 'address', type: 'address' },
          { name: 'tokenOut', internalType: 'address', type: 'address' },
          { name: 'deployer', internalType: 'address', type: 'address' },
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
          { name: 'amountInMaximum', internalType: 'uint256', type: 'uint256' },
          { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
        ],
      },
    ],
    name: 'exactOutputSingle',
    outputs: [{ name: 'amountIn', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'factory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'data', internalType: 'bytes[]', type: 'bytes[]' }],
    name: 'multicall',
    outputs: [{ name: 'results', internalType: 'bytes[]', type: 'bytes[]' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'poolDeployer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'refundNativeToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'expiry', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermitAllowed',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'expiry', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermitAllowedIfNecessary',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'selfPermitIfNecessary',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amountMinimum', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'sweepToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amountMinimum', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'feeBips', internalType: 'uint256', type: 'uint256' },
      { name: 'feeRecipient', internalType: 'address', type: 'address' },
    ],
    name: 'sweepTokenWithFee',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amountMinimum', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'unwrapWNativeToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amountMinimum', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'feeBips', internalType: 'uint256', type: 'uint256' },
      { name: 'feeRecipient', internalType: 'address', type: 'address' },
    ],
    name: 'unwrapWNativeTokenWithFee',
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'receive', stateMutability: 'payable' },
  { type: 'error', inputs: [], name: 'alreadyInitialized' },
  { type: 'error', inputs: [], name: 'arithmeticError' },
  { type: 'error', inputs: [], name: 'bottomTickLowerThanMIN' },
  { type: 'error', inputs: [], name: 'dynamicFeeActive' },
  { type: 'error', inputs: [], name: 'dynamicFeeDisabled' },
  { type: 'error', inputs: [], name: 'flashInsufficientPaid0' },
  { type: 'error', inputs: [], name: 'flashInsufficientPaid1' },
  { type: 'error', inputs: [], name: 'incorrectPluginFee' },
  { type: 'error', inputs: [], name: 'insufficientInputAmount' },
  { type: 'error', inputs: [], name: 'invalidAmountRequired' },
  {
    type: 'error',
    inputs: [
      { name: 'expectedSelector', internalType: 'bytes4', type: 'bytes4' },
    ],
    name: 'invalidHookResponse',
  },
  { type: 'error', inputs: [], name: 'invalidLimitSqrtPrice' },
  { type: 'error', inputs: [], name: 'invalidNewCommunityFee' },
  { type: 'error', inputs: [], name: 'invalidNewTickSpacing' },
  { type: 'error', inputs: [], name: 'liquidityAdd' },
  { type: 'error', inputs: [], name: 'liquidityOverflow' },
  { type: 'error', inputs: [], name: 'liquiditySub' },
  { type: 'error', inputs: [], name: 'locked' },
  { type: 'error', inputs: [], name: 'notAllowed' },
  { type: 'error', inputs: [], name: 'notInitialized' },
  { type: 'error', inputs: [], name: 'pluginIsNotConnected' },
  { type: 'error', inputs: [], name: 'priceOutOfRange' },
  { type: 'error', inputs: [], name: 'tickInvalidLinks' },
  { type: 'error', inputs: [], name: 'tickIsNotInitialized' },
  { type: 'error', inputs: [], name: 'tickIsNotSpaced' },
  { type: 'error', inputs: [], name: 'tickOutOfRange' },
  { type: 'error', inputs: [], name: 'topTickAboveMAX' },
  { type: 'error', inputs: [], name: 'topTickLowerOrEqBottomTick' },
  { type: 'error', inputs: [], name: 'transferFailed' },
  { type: 'error', inputs: [], name: 'zeroAmountRequired' },
  { type: 'error', inputs: [], name: 'zeroLiquidityActual' },
  { type: 'error', inputs: [], name: 'zeroLiquidityDesired' },
] as const

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const algebraRouterAddress = {
  80069: '0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69',
  80094: '0xFff605964840a5511f595EB970011EcBffa46b39',
  default: '0x0000000000000000000000000000000000000000',
} as const

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const algebraRouterConfig = {
  address: algebraRouterAddress,
  abi: algebraRouterAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgebraVirtualPool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const algebraVirtualPoolAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_farmingAddress', internalType: 'address', type: 'address' },
      { name: '_plugin', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'invalidFeeWeights' },
  { type: 'error', inputs: [], name: 'invalidNewMaxRate' },
  { type: 'error', inputs: [], name: 'invalidNewMinRate' },
  { type: 'error', inputs: [], name: 'liquidityAdd' },
  { type: 'error', inputs: [], name: 'liquidityOverflow' },
  { type: 'error', inputs: [], name: 'liquiditySub' },
  { type: 'error', inputs: [], name: 'onlyFarming' },
  { type: 'error', inputs: [], name: 'onlyPlugin' },
  { type: 'error', inputs: [], name: 'tickInvalidLinks' },
  { type: 'error', inputs: [], name: 'tickIsNotInitialized' },
  {
    type: 'function',
    inputs: [],
    name: 'FEE_WEIGHT_DENOMINATOR',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RATE_CHANGE_FREQUENCY',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token0Amount', internalType: 'uint128', type: 'uint128' },
      { name: 'token1Amount', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'addRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bottomTick', internalType: 'int24', type: 'int24' },
      { name: 'topTick', internalType: 'int24', type: 'int24' },
      { name: 'liquidityDelta', internalType: 'int128', type: 'int128' },
      { name: 'currentTick', internalType: 'int24', type: 'int24' },
    ],
    name: 'applyLiquidityDeltaToPosition',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targetTick', internalType: 'int24', type: 'int24' },
      { name: 'zeroToOne', internalType: 'bool', type: 'bool' },
      { name: 'feeAmount', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'crossTo',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currentLiquidity',
    outputs: [{ name: '', internalType: 'uint128', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deactivate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deactivated',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token0Amount', internalType: 'uint128', type: 'uint128' },
      { name: 'token1Amount', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'decreaseRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'distributeRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'dynamicRateActivated',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'farmingAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeWeights',
    outputs: [
      { name: 'weight0', internalType: 'uint16', type: 'uint16' },
      { name: 'weight1', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'bottomTick', internalType: 'int24', type: 'int24' },
      { name: 'topTick', internalType: 'int24', type: 'int24' },
    ],
    name: 'getInnerRewardsGrowth',
    outputs: [
      { name: 'rewardGrowthInside0', internalType: 'uint256', type: 'uint256' },
      { name: 'rewardGrowthInside1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'globalTick',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'plugin',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'prevTimestamp',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rateLimits',
    outputs: [
      { name: 'maxRewardRate0', internalType: 'uint128', type: 'uint128' },
      { name: 'maxRewardRate1', internalType: 'uint128', type: 'uint128' },
      { name: 'minRewardRate0', internalType: 'uint128', type: 'uint128' },
      { name: 'minRewardRate1', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rewardRates',
    outputs: [
      { name: 'rate0', internalType: 'uint128', type: 'uint128' },
      { name: 'rate1', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rewardReserves',
    outputs: [
      { name: 'reserve0', internalType: 'uint128', type: 'uint128' },
      { name: 'reserve1', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_maxRate0', internalType: 'uint128', type: 'uint128' },
      { name: '_maxRate1', internalType: 'uint128', type: 'uint128' },
      { name: '_minRate0', internalType: 'uint128', type: 'uint128' },
      { name: '_minRate1', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'setDynamicRateLimits',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'rate0', internalType: 'uint128', type: 'uint128' },
      { name: 'rate1', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'setRates',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'weight0', internalType: 'uint16', type: 'uint16' },
      { name: 'weight1', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'setWeights',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'isActive', internalType: 'bool', type: 'bool' }],
    name: 'switchDynamicRate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tickId', internalType: 'int24', type: 'int24' }],
    name: 'ticks',
    outputs: [
      { name: 'liquidityTotal', internalType: 'uint256', type: 'uint256' },
      { name: 'liquidityDelta', internalType: 'int128', type: 'int128' },
      { name: 'prevTick', internalType: 'int24', type: 'int24' },
      { name: 'nextTick', internalType: 'int24', type: 'int24' },
      {
        name: 'outerFeeGrowth0Token',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'outerFeeGrowth1Token',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalRewardGrowth',
    outputs: [
      { name: 'rewardGrowth0', internalType: 'uint256', type: 'uint256' },
      { name: 'rewardGrowth1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AlgerbaQuoterV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const algerbaQuoterV2Abi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_factory', internalType: 'address', type: 'address' },
      { name: '_WNativeToken', internalType: 'address', type: 'address' },
      { name: '_poolDeployer', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'WNativeToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount0Delta', internalType: 'int256', type: 'int256' },
      { name: 'amount1Delta', internalType: 'int256', type: 'int256' },
      { name: 'path', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'algebraSwapCallback',
    outputs: [],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'factory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'poolDeployer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'path', internalType: 'bytes', type: 'bytes' },
      { name: 'amountInRequired', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'quoteExactInput',
    outputs: [
      { name: 'amountOutList', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'amountInList', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 'sqrtPriceX96AfterList',
        internalType: 'uint160[]',
        type: 'uint160[]',
      },
      {
        name: 'initializedTicksCrossedList',
        internalType: 'uint32[]',
        type: 'uint32[]',
      },
      { name: 'gasEstimate', internalType: 'uint256', type: 'uint256' },
      { name: 'feeList', internalType: 'uint16[]', type: 'uint16[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct IQuoterV2.QuoteExactInputSingleParams',
        type: 'tuple',
        components: [
          { name: 'tokenIn', internalType: 'address', type: 'address' },
          { name: 'tokenOut', internalType: 'address', type: 'address' },
          { name: 'deployer', internalType: 'address', type: 'address' },
          { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
          { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
        ],
      },
    ],
    name: 'quoteExactInputSingle',
    outputs: [
      { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
      { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
      { name: 'sqrtPriceX96After', internalType: 'uint160', type: 'uint160' },
      {
        name: 'initializedTicksCrossed',
        internalType: 'uint32',
        type: 'uint32',
      },
      { name: 'gasEstimate', internalType: 'uint256', type: 'uint256' },
      { name: 'fee', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'path', internalType: 'bytes', type: 'bytes' },
      { name: 'amountOutRequired', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'quoteExactOutput',
    outputs: [
      { name: 'amountOutList', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'amountInList', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 'sqrtPriceX96AfterList',
        internalType: 'uint160[]',
        type: 'uint160[]',
      },
      {
        name: 'initializedTicksCrossedList',
        internalType: 'uint32[]',
        type: 'uint32[]',
      },
      { name: 'gasEstimate', internalType: 'uint256', type: 'uint256' },
      { name: 'feeList', internalType: 'uint16[]', type: 'uint16[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct IQuoterV2.QuoteExactOutputSingleParams',
        type: 'tuple',
        components: [
          { name: 'tokenIn', internalType: 'address', type: 'address' },
          { name: 'tokenOut', internalType: 'address', type: 'address' },
          { name: 'deployer', internalType: 'address', type: 'address' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'limitSqrtPrice', internalType: 'uint160', type: 'uint160' },
        ],
      },
    ],
    name: 'quoteExactOutputSingle',
    outputs: [
      { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
      { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
      { name: 'sqrtPriceX96After', internalType: 'uint160', type: 'uint160' },
      {
        name: 'initializedTicksCrossed',
        internalType: 'uint32',
        type: 'uint32',
      },
      { name: 'gasEstimate', internalType: 'uint256', type: 'uint256' },
      { name: 'fee', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const algerbaQuoterV2Address = {
  80069: '0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C',
  80094: '0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2',
  default: '0x0000000000000000000000000000000000000000',
} as const

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const algerbaQuoterV2Config = {
  address: algerbaQuoterV2Address,
  abi: algerbaQuoterV2Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: '_from', type: 'address' },
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  { payable: true, type: 'fallback', stateMutability: 'payable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FarmingCenter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const farmingCenterAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_eternalFarming',
        internalType: 'contract IAlgebraEternalFarming',
        type: 'address',
      },
      {
        name: '_nonfungiblePositionManager',
        internalType: 'contract INonfungiblePositionManager',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'algebraPoolDeployer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'int256', type: 'int256' },
    ],
    name: 'applyLiquidityDelta',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
      },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amountRequested', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimReward',
    outputs: [
      { name: 'rewardBalanceBefore', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'collectRewards',
    outputs: [
      { name: 'reward', internalType: 'uint256', type: 'uint256' },
      { name: 'bonusReward', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newVirtualPool', internalType: 'address', type: 'address' },
      {
        name: 'plugin',
        internalType: 'contract IFarmingPlugin',
        type: 'address',
      },
    ],
    name: 'connectVirtualPoolToPlugin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'deposits',
    outputs: [
      { name: 'incentiveId', internalType: 'bytes32', type: 'bytes32' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'virtualPool', internalType: 'address', type: 'address' },
      {
        name: 'plugin',
        internalType: 'contract IFarmingPlugin',
        type: 'address',
      },
    ],
    name: 'disconnectVirtualPoolFromPlugin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'enterFarming',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'eternalFarming',
    outputs: [
      {
        name: '',
        internalType: 'contract IAlgebraEternalFarming',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'key',
        internalType: 'struct IncentiveKey',
        type: 'tuple',
        components: [
          {
            name: 'rewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'bonusRewardToken',
            internalType: 'contract IERC20Minimal',
            type: 'address',
          },
          {
            name: 'pool',
            internalType: 'contract IAlgebraPool',
            type: 'address',
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'exitFarming',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'incentiveId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'incentiveKeys',
    outputs: [
      {
        name: 'rewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
      },
      {
        name: 'bonusRewardToken',
        internalType: 'contract IERC20Minimal',
        type: 'address',
      },
      { name: 'pool', internalType: 'contract IAlgebraPool', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'data', internalType: 'bytes[]', type: 'bytes[]' }],
    name: 'multicall',
    outputs: [{ name: 'results', internalType: 'bytes[]', type: 'bytes[]' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nonfungiblePositionManager',
    outputs: [
      {
        name: '',
        internalType: 'contract INonfungiblePositionManager',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolAddress', internalType: 'address', type: 'address' }],
    name: 'virtualPoolAddresses',
    outputs: [
      { name: 'virtualPoolAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
] as const

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const farmingCenterAddress = {
  80069: '0x0000000000000000000000000000000000000000',
  80094: '0xD8399d82eb577F223f55e81EfB96942Ce560f51f',
  default: '0x0000000000000000000000000000000000000000',
} as const

/**
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const farmingCenterConfig = {
  address: farmingCenterAddress,
  abi: farmingCenterAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICHIVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ichiVaultAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_pool', internalType: 'address', type: 'address' },
      { name: '_allowToken0', internalType: 'bool', type: 'bool' },
      { name: '_allowToken1', internalType: 'bool', type: 'bool' },
      { name: '__owner', internalType: 'address', type: 'address' },
      { name: '_twapPeriod', internalType: 'uint32', type: 'uint32' },
      { name: '_vaultIndex', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PRECISION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'affiliate',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'algebraMintCallback',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount0Delta', internalType: 'int256', type: 'int256' },
      { name: 'amount1Delta', internalType: 'int256', type: 'int256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'algebraSwapCallback',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'allowToken0',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'allowToken1',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ammFeeRecipient',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'baseLower',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'baseUpper',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'collectFees',
    outputs: [
      { name: 'fees0', internalType: 'uint256', type: 'uint256' },
      { name: 'fees1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currentTick',
    outputs: [{ name: 'tick', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'subtractedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'deposit0', internalType: 'uint256', type: 'uint256' },
      { name: 'deposit1', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'deposit',
    outputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deposit0Max',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deposit1Max',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'fee',
    outputs: [{ name: 'fee_', internalType: 'uint24', type: 'uint24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBasePosition',
    outputs: [
      { name: 'liquidity', internalType: 'uint128', type: 'uint128' },
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getLimitPosition',
    outputs: [
      { name: 'liquidity', internalType: 'uint128', type: 'uint128' },
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalAmounts',
    outputs: [
      { name: 'total0', internalType: 'uint256', type: 'uint256' },
      { name: 'total1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'hysteresis',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ichiVaultFactory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'addedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'limitLower',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'limitUpper',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pool',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_baseLower', internalType: 'int24', type: 'int24' },
      { name: '_baseUpper', internalType: 'int24', type: 'int24' },
      { name: '_limitLower', internalType: 'int24', type: 'int24' },
      { name: '_limitUpper', internalType: 'int24', type: 'int24' },
      { name: 'swapQuantity', internalType: 'int256', type: 'int256' },
    ],
    name: 'rebalance',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_affiliate', internalType: 'address', type: 'address' }],
    name: 'setAffiliate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_ammFeeRecipient', internalType: 'address', type: 'address' },
    ],
    name: 'setAmmFeeRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_deposit0Max', internalType: 'uint256', type: 'uint256' },
      { name: '_deposit1Max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setDepositMax',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_hysteresis', internalType: 'uint256', type: 'uint256' }],
    name: 'setHysteresis',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newTwapPeriod', internalType: 'uint32', type: 'uint32' }],
    name: 'setTwapPeriod',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tickSpacing',
    outputs: [{ name: '', internalType: 'int24', type: 'int24' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token0',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token1',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'twapPeriod',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [
      { name: 'amount0', internalType: 'uint256', type: 'uint256' },
      { name: 'amount1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'affiliate',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Affiliate',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'ammFeeRecipient',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AmmFeeRecipient',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'feeAmount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'feeAmount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CollectFees',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'allowToken0',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      {
        name: 'allowToken1',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'twapPeriod',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DeployICHIVault',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'shares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'deposit0Max',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'deposit1Max',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DepositMax',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'hysteresis',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Hysteresis',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'tick', internalType: 'int24', type: 'int24', indexed: false },
      {
        name: 'totalAmount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'totalAmount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'feeAmount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'feeAmount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'totalSupply',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Rebalance',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newTwapPeriod',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
    ],
    name: 'SetTwapPeriod',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'shares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount0',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount1',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdraw',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICHIVaultFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ichiVaultFactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_algebraFactory', internalType: 'address', type: 'address' },
      { name: '_basePluginFactory', internalType: 'address', type: 'address' },
      { name: '_ammName', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'algebraFactory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'allVaults',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ammFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ammName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'baseFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'baseFeeSplit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'basePluginFactory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenA', internalType: 'address', type: 'address' },
      { name: 'allowTokenA', internalType: 'bool', type: 'bool' },
      { name: 'tokenB', internalType: 'address', type: 'address' },
      { name: 'allowTokenB', internalType: 'bool', type: 'bool' },
    ],
    name: 'createICHIVault',
    outputs: [{ name: 'ichiVault', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeRecipient',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'deployer', internalType: 'address', type: 'address' },
      { name: 'token0', internalType: 'address', type: 'address' },
      { name: 'token1', internalType: 'address', type: 'address' },
      { name: 'allowToken0', internalType: 'bool', type: 'bool' },
      { name: 'allowToken1', internalType: 'bool', type: 'bool' },
    ],
    name: 'genKey',
    outputs: [{ name: 'key', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getICHIVault',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_ammFee', internalType: 'uint256', type: 'uint256' }],
    name: 'setAmmFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_baseFee', internalType: 'uint256', type: 'uint256' }],
    name: 'setBaseFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_baseFeeSplit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setBaseFeeSplit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_feeRecipient', internalType: 'address', type: 'address' },
    ],
    name: 'setFeeRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'ammFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AmmFee',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'baseFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'BaseFee',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'baseFeeSplit',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'BaseFeeSplit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'algebraFactory',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'basePluginFactory',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'DeployICHIVaultFactory',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'feeRecipient',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'FeeRecipient',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'ichiVault',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'tokenA',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'allowTokenA',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      {
        name: 'tokenB',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'allowTokenB',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      {
        name: 'count',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ICHIVaultCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WrappedNative
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const wrappedNativeAbi = [
  { type: 'error', inputs: [], name: 'AllowanceOverflow' },
  { type: 'error', inputs: [], name: 'AllowanceUnderflow' },
  { type: 'error', inputs: [], name: 'ETHTransferFailed' },
  { type: 'error', inputs: [], name: 'InsufficientAllowance' },
  { type: 'error', inputs: [], name: 'InsufficientBalance' },
  { type: 'error', inputs: [], name: 'InvalidPermit' },
  { type: 'error', inputs: [], name: 'PermitExpired' },
  { type: 'error', inputs: [], name: 'TotalSupplyOverflow' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdrawal',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: 'result', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: 'result', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'result', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: 'result', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: 'result', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__
 */
export const useReadAlgebraBasePlugin = /*#__PURE__*/ createUseReadContract({
  abi: algebraBasePluginAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"ALGEBRA_BASE_PLUGIN_MANAGER"`
 */
export const useReadAlgebraBasePluginAlgebraBasePluginManager =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 'ALGEBRA_BASE_PLUGIN_MANAGER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"defaultPluginConfig"`
 */
export const useReadAlgebraBasePluginDefaultPluginConfig =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 'defaultPluginConfig',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"getCurrentFee"`
 */
export const useReadAlgebraBasePluginGetCurrentFee =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 'getCurrentFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"getPool"`
 */
export const useReadAlgebraBasePluginGetPool =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 'getPool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"getSingleTimepoint"`
 */
export const useReadAlgebraBasePluginGetSingleTimepoint =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 'getSingleTimepoint',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"getTimepoints"`
 */
export const useReadAlgebraBasePluginGetTimepoints =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 'getTimepoints',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"handlePluginFee"`
 */
export const useReadAlgebraBasePluginHandlePluginFee =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 'handlePluginFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"incentive"`
 */
export const useReadAlgebraBasePluginIncentive =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 'incentive',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"isIncentiveConnected"`
 */
export const useReadAlgebraBasePluginIsIncentiveConnected =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 'isIncentiveConnected',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"isInitialized"`
 */
export const useReadAlgebraBasePluginIsInitialized =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 'isInitialized',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"lastTimepointTimestamp"`
 */
export const useReadAlgebraBasePluginLastTimepointTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 'lastTimepointTimestamp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"pool"`
 */
export const useReadAlgebraBasePluginPool = /*#__PURE__*/ createUseReadContract(
  { abi: algebraBasePluginAbi, functionName: 'pool' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"s_baseFee"`
 */
export const useReadAlgebraBasePluginSBaseFee =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 's_baseFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"s_feeFactors"`
 */
export const useReadAlgebraBasePluginSFeeFactors =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 's_feeFactors',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"s_priceChangeFactor"`
 */
export const useReadAlgebraBasePluginSPriceChangeFactor =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 's_priceChangeFactor',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"timepointIndex"`
 */
export const useReadAlgebraBasePluginTimepointIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 'timepointIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"timepoints"`
 */
export const useReadAlgebraBasePluginTimepoints =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraBasePluginAbi,
    functionName: 'timepoints',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__
 */
export const useWriteAlgebraBasePlugin = /*#__PURE__*/ createUseWriteContract({
  abi: algebraBasePluginAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"afterFlash"`
 */
export const useWriteAlgebraBasePluginAfterFlash =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginAbi,
    functionName: 'afterFlash',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"afterInitialize"`
 */
export const useWriteAlgebraBasePluginAfterInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginAbi,
    functionName: 'afterInitialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"afterModifyPosition"`
 */
export const useWriteAlgebraBasePluginAfterModifyPosition =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginAbi,
    functionName: 'afterModifyPosition',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"afterSwap"`
 */
export const useWriteAlgebraBasePluginAfterSwap =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginAbi,
    functionName: 'afterSwap',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"beforeFlash"`
 */
export const useWriteAlgebraBasePluginBeforeFlash =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginAbi,
    functionName: 'beforeFlash',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"beforeInitialize"`
 */
export const useWriteAlgebraBasePluginBeforeInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginAbi,
    functionName: 'beforeInitialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"beforeModifyPosition"`
 */
export const useWriteAlgebraBasePluginBeforeModifyPosition =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginAbi,
    functionName: 'beforeModifyPosition',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"beforeSwap"`
 */
export const useWriteAlgebraBasePluginBeforeSwap =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginAbi,
    functionName: 'beforeSwap',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"collectPluginFee"`
 */
export const useWriteAlgebraBasePluginCollectPluginFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginAbi,
    functionName: 'collectPluginFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteAlgebraBasePluginInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"prepayTimepointsStorageSlots"`
 */
export const useWriteAlgebraBasePluginPrepayTimepointsStorageSlots =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginAbi,
    functionName: 'prepayTimepointsStorageSlots',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"setBaseFee"`
 */
export const useWriteAlgebraBasePluginSetBaseFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginAbi,
    functionName: 'setBaseFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"setIncentive"`
 */
export const useWriteAlgebraBasePluginSetIncentive =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginAbi,
    functionName: 'setIncentive',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"setPriceChangeFactor"`
 */
export const useWriteAlgebraBasePluginSetPriceChangeFactor =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraBasePluginAbi,
    functionName: 'setPriceChangeFactor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__
 */
export const useSimulateAlgebraBasePlugin =
  /*#__PURE__*/ createUseSimulateContract({ abi: algebraBasePluginAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"afterFlash"`
 */
export const useSimulateAlgebraBasePluginAfterFlash =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginAbi,
    functionName: 'afterFlash',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"afterInitialize"`
 */
export const useSimulateAlgebraBasePluginAfterInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginAbi,
    functionName: 'afterInitialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"afterModifyPosition"`
 */
export const useSimulateAlgebraBasePluginAfterModifyPosition =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginAbi,
    functionName: 'afterModifyPosition',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"afterSwap"`
 */
export const useSimulateAlgebraBasePluginAfterSwap =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginAbi,
    functionName: 'afterSwap',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"beforeFlash"`
 */
export const useSimulateAlgebraBasePluginBeforeFlash =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginAbi,
    functionName: 'beforeFlash',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"beforeInitialize"`
 */
export const useSimulateAlgebraBasePluginBeforeInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginAbi,
    functionName: 'beforeInitialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"beforeModifyPosition"`
 */
export const useSimulateAlgebraBasePluginBeforeModifyPosition =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginAbi,
    functionName: 'beforeModifyPosition',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"beforeSwap"`
 */
export const useSimulateAlgebraBasePluginBeforeSwap =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginAbi,
    functionName: 'beforeSwap',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"collectPluginFee"`
 */
export const useSimulateAlgebraBasePluginCollectPluginFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginAbi,
    functionName: 'collectPluginFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateAlgebraBasePluginInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"prepayTimepointsStorageSlots"`
 */
export const useSimulateAlgebraBasePluginPrepayTimepointsStorageSlots =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginAbi,
    functionName: 'prepayTimepointsStorageSlots',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"setBaseFee"`
 */
export const useSimulateAlgebraBasePluginSetBaseFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginAbi,
    functionName: 'setBaseFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"setIncentive"`
 */
export const useSimulateAlgebraBasePluginSetIncentive =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginAbi,
    functionName: 'setIncentive',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `functionName` set to `"setPriceChangeFactor"`
 */
export const useSimulateAlgebraBasePluginSetPriceChangeFactor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraBasePluginAbi,
    functionName: 'setPriceChangeFactor',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraBasePluginAbi}__
 */
export const useWatchAlgebraBasePluginEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: algebraBasePluginAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `eventName` set to `"BaseFee"`
 */
export const useWatchAlgebraBasePluginBaseFeeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraBasePluginAbi,
    eventName: 'BaseFee',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `eventName` set to `"Incentive"`
 */
export const useWatchAlgebraBasePluginIncentiveEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraBasePluginAbi,
    eventName: 'Incentive',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraBasePluginAbi}__ and `eventName` set to `"PriceChangeFactor"`
 */
export const useWatchAlgebraBasePluginPriceChangeFactorEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraBasePluginAbi,
    eventName: 'PriceChangeFactor',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useReadAlgebraEternalFarming = /*#__PURE__*/ createUseReadContract(
  { abi: algebraEternalFarmingAbi, address: algebraEternalFarmingAddress },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"FARMINGS_ADMINISTRATOR_ROLE"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useReadAlgebraEternalFarmingFarmingsAdministratorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'FARMINGS_ADMINISTRATOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"INCENTIVE_MAKER_ROLE"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useReadAlgebraEternalFarmingIncentiveMakerRole =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'INCENTIVE_MAKER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"farmingCenter"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useReadAlgebraEternalFarmingFarmingCenter =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'farmingCenter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"farms"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useReadAlgebraEternalFarmingFarms =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'farms',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"getRewardInfo"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useReadAlgebraEternalFarmingGetRewardInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'getRewardInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"incentives"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useReadAlgebraEternalFarmingIncentives =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'incentives',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"isEmergencyWithdrawActivated"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useReadAlgebraEternalFarmingIsEmergencyWithdrawActivated =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'isEmergencyWithdrawActivated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"isIncentiveDeactivated"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useReadAlgebraEternalFarmingIsIncentiveDeactivated =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'isIncentiveDeactivated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"nonfungiblePositionManager"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useReadAlgebraEternalFarmingNonfungiblePositionManager =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'nonfungiblePositionManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"numOfIncentives"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useReadAlgebraEternalFarmingNumOfIncentives =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'numOfIncentives',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"rewards"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useReadAlgebraEternalFarmingRewards =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'rewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWriteAlgebraEternalFarming =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"addRewards"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWriteAlgebraEternalFarmingAddRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'addRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"claimReward"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWriteAlgebraEternalFarmingClaimReward =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'claimReward',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"claimRewardFrom"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWriteAlgebraEternalFarmingClaimRewardFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'claimRewardFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"collectRewards"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWriteAlgebraEternalFarmingCollectRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'collectRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"createEternalFarming"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWriteAlgebraEternalFarmingCreateEternalFarming =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'createEternalFarming',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"deactivateIncentive"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWriteAlgebraEternalFarmingDeactivateIncentive =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'deactivateIncentive',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"decreaseRewardsAmount"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWriteAlgebraEternalFarmingDecreaseRewardsAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'decreaseRewardsAmount',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"enterFarming"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWriteAlgebraEternalFarmingEnterFarming =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'enterFarming',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"exitFarming"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWriteAlgebraEternalFarmingExitFarming =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'exitFarming',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setEmergencyWithdrawStatus"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWriteAlgebraEternalFarmingSetEmergencyWithdrawStatus =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setEmergencyWithdrawStatus',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setFarmingCenterAddress"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWriteAlgebraEternalFarmingSetFarmingCenterAddress =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setFarmingCenterAddress',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setRates"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWriteAlgebraEternalFarmingSetRates =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setRates',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useSimulateAlgebraEternalFarming =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"addRewards"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useSimulateAlgebraEternalFarmingAddRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'addRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"claimReward"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useSimulateAlgebraEternalFarmingClaimReward =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'claimReward',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"claimRewardFrom"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useSimulateAlgebraEternalFarmingClaimRewardFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'claimRewardFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"collectRewards"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useSimulateAlgebraEternalFarmingCollectRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'collectRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"createEternalFarming"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useSimulateAlgebraEternalFarmingCreateEternalFarming =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'createEternalFarming',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"deactivateIncentive"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useSimulateAlgebraEternalFarmingDeactivateIncentive =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'deactivateIncentive',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"decreaseRewardsAmount"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useSimulateAlgebraEternalFarmingDecreaseRewardsAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'decreaseRewardsAmount',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"enterFarming"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useSimulateAlgebraEternalFarmingEnterFarming =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'enterFarming',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"exitFarming"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useSimulateAlgebraEternalFarmingExitFarming =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'exitFarming',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setEmergencyWithdrawStatus"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useSimulateAlgebraEternalFarmingSetEmergencyWithdrawStatus =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setEmergencyWithdrawStatus',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setFarmingCenterAddress"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useSimulateAlgebraEternalFarmingSetFarmingCenterAddress =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setFarmingCenterAddress',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `functionName` set to `"setRates"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useSimulateAlgebraEternalFarmingSetRates =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    functionName: 'setRates',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWatchAlgebraEternalFarmingEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"EmergencyWithdraw"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWatchAlgebraEternalFarmingEmergencyWithdrawEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'EmergencyWithdraw',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"EternalFarmingCreated"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWatchAlgebraEternalFarmingEternalFarmingCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'EternalFarmingCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"FarmEnded"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWatchAlgebraEternalFarmingFarmEndedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'FarmEnded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"FarmEntered"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWatchAlgebraEternalFarmingFarmEnteredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'FarmEntered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"FarmingCenter"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWatchAlgebraEternalFarmingFarmingCenterEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'FarmingCenter',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"IncentiveDeactivated"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWatchAlgebraEternalFarmingIncentiveDeactivatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'IncentiveDeactivated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardAmountsDecreased"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWatchAlgebraEternalFarmingRewardAmountsDecreasedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardAmountsDecreased',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardClaimed"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWatchAlgebraEternalFarmingRewardClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardsAdded"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWatchAlgebraEternalFarmingRewardsAddedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardsAdded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardsCollected"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWatchAlgebraEternalFarmingRewardsCollectedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardsCollected',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraEternalFarmingAbi}__ and `eventName` set to `"RewardsRatesChanged"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x8554797BaE76Afe81dD5375111A2f3b0414D3B02)
 */
export const useWatchAlgebraEternalFarmingRewardsRatesChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraEternalFarmingAbi,
    address: algebraEternalFarmingAddress,
    eventName: 'RewardsRatesChanged',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactory = /*#__PURE__*/ createUseReadContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"CUSTOM_POOL_DEPLOYER"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryCustomPoolDeployer =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'CUSTOM_POOL_DEPLOYER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"POOLS_ADMINISTRATOR_ROLE"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryPoolsAdministratorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'POOLS_ADMINISTRATOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"POOL_INIT_CODE_HASH"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryPoolInitCodeHash =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'POOL_INIT_CODE_HASH',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"computeCustomPoolAddress"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryComputeCustomPoolAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'computeCustomPoolAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"computePoolAddress"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryComputePoolAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'computePoolAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"customPoolByPair"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryCustomPoolByPair =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'customPoolByPair',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultCommunityFee"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryDefaultCommunityFee =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'defaultCommunityFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultConfigurationForPool"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryDefaultConfigurationForPool =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'defaultConfigurationForPool',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultFee"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryDefaultFee =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'defaultFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultPluginFactory"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryDefaultPluginFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'defaultPluginFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"defaultTickspacing"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryDefaultTickspacing =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'defaultTickspacing',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"getRoleAdmin"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"getRoleMember"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryGetRoleMember =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'getRoleMember',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"getRoleMemberCount"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryGetRoleMemberCount =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'getRoleMemberCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"hasRole"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryHasRole = /*#__PURE__*/ createUseReadContract(
  {
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'hasRole',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"hasRoleOrOwner"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryHasRoleOrOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'hasRoleOrOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryOwner = /*#__PURE__*/ createUseReadContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"pendingOwner"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryPendingOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'pendingOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"poolByPair"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryPoolByPair =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'poolByPair',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"poolDeployer"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryPoolDeployer =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'poolDeployer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceOwnershipStartTimestamp"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryRenounceOwnershipStartTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceOwnershipStartTimestamp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactorySupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"vaultFactory"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useReadAlgebraFactoryVaultFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'vaultFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactory = /*#__PURE__*/ createUseWriteContract({
  abi: algebraFactoryAbi,
  address: algebraFactoryAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactoryAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"createCustomPool"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactoryCreateCustomPool =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'createCustomPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"createPool"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactoryCreatePool =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'createPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"grantRole"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactoryGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactoryRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceRole"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactoryRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"revokeRole"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactoryRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultCommunityFee"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactorySetDefaultCommunityFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultCommunityFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultFee"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactorySetDefaultFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultPluginFactory"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactorySetDefaultPluginFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultPluginFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultTickspacing"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactorySetDefaultTickspacing =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultTickspacing',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setVaultFactory"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactorySetVaultFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setVaultFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"startRenounceOwnership"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactoryStartRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'startRenounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"stopRenounceOwnership"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactoryStopRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'stopRenounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWriteAlgebraFactoryTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactoryAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"createCustomPool"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactoryCreateCustomPool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'createCustomPool',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"createPool"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactoryCreatePool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'createPool',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"grantRole"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactoryGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactoryRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"renounceRole"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactoryRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"revokeRole"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactoryRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultCommunityFee"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactorySetDefaultCommunityFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultCommunityFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultFee"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactorySetDefaultFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultPluginFactory"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactorySetDefaultPluginFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultPluginFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setDefaultTickspacing"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactorySetDefaultTickspacing =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setDefaultTickspacing',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"setVaultFactory"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactorySetVaultFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'setVaultFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"startRenounceOwnership"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactoryStartRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'startRenounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"stopRenounceOwnership"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactoryStopRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'stopRenounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useSimulateAlgebraFactoryTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"CustomPool"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryCustomPoolEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'CustomPool',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"DefaultCommunityFee"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryDefaultCommunityFeeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'DefaultCommunityFee',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"DefaultFee"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryDefaultFeeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'DefaultFee',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"DefaultPluginFactory"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryDefaultPluginFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'DefaultPluginFactory',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"DefaultTickspacing"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryDefaultTickspacingEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'DefaultTickspacing',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryOwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"Pool"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryPoolEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'Pool',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RenounceOwnershipFinish"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryRenounceOwnershipFinishEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RenounceOwnershipFinish',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RenounceOwnershipStart"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryRenounceOwnershipStartEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RenounceOwnershipStart',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RenounceOwnershipStop"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryRenounceOwnershipStopEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RenounceOwnershipStop',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RoleAdminChanged"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RoleGranted"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"RoleRevoked"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraFactoryAbi}__ and `eventName` set to `"VaultFactory"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xad88D4ABbE0d0672f00eB3B83E6518608d82e95d)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x7d53327D78EFD0b463bd8d7dc938C52402323b95)
 */
export const useWatchAlgebraFactoryVaultFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraFactoryAbi,
    address: algebraFactoryAddress,
    eventName: 'VaultFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__
 */
export const useReadAlgebraPool = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"communityFeeLastTimestamp"`
 */
export const useReadAlgebraPoolCommunityFeeLastTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'communityFeeLastTimestamp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"communityVault"`
 */
export const useReadAlgebraPoolCommunityVault =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'communityVault',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"factory"`
 */
export const useReadAlgebraPoolFactory = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'factory',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"fee"`
 */
export const useReadAlgebraPoolFee = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'fee',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"getCommunityFeePending"`
 */
export const useReadAlgebraPoolGetCommunityFeePending =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'getCommunityFeePending',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"getReserves"`
 */
export const useReadAlgebraPoolGetReserves =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'getReserves',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"globalState"`
 */
export const useReadAlgebraPoolGlobalState =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'globalState',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"liquidity"`
 */
export const useReadAlgebraPoolLiquidity = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'liquidity',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"maxLiquidityPerTick"`
 */
export const useReadAlgebraPoolMaxLiquidityPerTick =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'maxLiquidityPerTick',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"nextTickGlobal"`
 */
export const useReadAlgebraPoolNextTickGlobal =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'nextTickGlobal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"plugin"`
 */
export const useReadAlgebraPoolPlugin = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'plugin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"positions"`
 */
export const useReadAlgebraPoolPositions = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'positions',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"prevTickGlobal"`
 */
export const useReadAlgebraPoolPrevTickGlobal =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'prevTickGlobal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"tickSpacing"`
 */
export const useReadAlgebraPoolTickSpacing =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'tickSpacing',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"tickTable"`
 */
export const useReadAlgebraPoolTickTable = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'tickTable',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"ticks"`
 */
export const useReadAlgebraPoolTicks = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'ticks',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"token0"`
 */
export const useReadAlgebraPoolToken0 = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'token0',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"token1"`
 */
export const useReadAlgebraPoolToken1 = /*#__PURE__*/ createUseReadContract({
  abi: algebraPoolAbi,
  functionName: 'token1',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"totalFeeGrowth0Token"`
 */
export const useReadAlgebraPoolTotalFeeGrowth0Token =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'totalFeeGrowth0Token',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"totalFeeGrowth1Token"`
 */
export const useReadAlgebraPoolTotalFeeGrowth1Token =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPoolAbi,
    functionName: 'totalFeeGrowth1Token',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__
 */
export const useWriteAlgebraPool = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"burn"`
 */
export const useWriteAlgebraPoolBurn = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"collect"`
 */
export const useWriteAlgebraPoolCollect = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
  functionName: 'collect',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"flash"`
 */
export const useWriteAlgebraPoolFlash = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
  functionName: 'flash',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteAlgebraPoolInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPoolAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteAlgebraPoolMint = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setCommunityFee"`
 */
export const useWriteAlgebraPoolSetCommunityFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPoolAbi,
    functionName: 'setCommunityFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setFee"`
 */
export const useWriteAlgebraPoolSetFee = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
  functionName: 'setFee',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setPlugin"`
 */
export const useWriteAlgebraPoolSetPlugin =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPoolAbi,
    functionName: 'setPlugin',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setPluginConfig"`
 */
export const useWriteAlgebraPoolSetPluginConfig =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPoolAbi,
    functionName: 'setPluginConfig',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setTickSpacing"`
 */
export const useWriteAlgebraPoolSetTickSpacing =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPoolAbi,
    functionName: 'setTickSpacing',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"swap"`
 */
export const useWriteAlgebraPoolSwap = /*#__PURE__*/ createUseWriteContract({
  abi: algebraPoolAbi,
  functionName: 'swap',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"swapWithPaymentInAdvance"`
 */
export const useWriteAlgebraPoolSwapWithPaymentInAdvance =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPoolAbi,
    functionName: 'swapWithPaymentInAdvance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__
 */
export const useSimulateAlgebraPool = /*#__PURE__*/ createUseSimulateContract({
  abi: algebraPoolAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulateAlgebraPoolBurn =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"collect"`
 */
export const useSimulateAlgebraPoolCollect =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'collect',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"flash"`
 */
export const useSimulateAlgebraPoolFlash =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'flash',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateAlgebraPoolInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateAlgebraPoolMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setCommunityFee"`
 */
export const useSimulateAlgebraPoolSetCommunityFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setCommunityFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setFee"`
 */
export const useSimulateAlgebraPoolSetFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setPlugin"`
 */
export const useSimulateAlgebraPoolSetPlugin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setPlugin',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setPluginConfig"`
 */
export const useSimulateAlgebraPoolSetPluginConfig =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setPluginConfig',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"setTickSpacing"`
 */
export const useSimulateAlgebraPoolSetTickSpacing =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'setTickSpacing',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"swap"`
 */
export const useSimulateAlgebraPoolSwap =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'swap',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPoolAbi}__ and `functionName` set to `"swapWithPaymentInAdvance"`
 */
export const useSimulateAlgebraPoolSwapWithPaymentInAdvance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPoolAbi,
    functionName: 'swapWithPaymentInAdvance',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__
 */
export const useWatchAlgebraPoolEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: algebraPoolAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Burn"`
 */
export const useWatchAlgebraPoolBurnEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Burn',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Collect"`
 */
export const useWatchAlgebraPoolCollectEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Collect',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"CommunityFee"`
 */
export const useWatchAlgebraPoolCommunityFeeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'CommunityFee',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Fee"`
 */
export const useWatchAlgebraPoolFeeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Fee',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Flash"`
 */
export const useWatchAlgebraPoolFlashEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Flash',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Initialize"`
 */
export const useWatchAlgebraPoolInitializeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Initialize',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Mint"`
 */
export const useWatchAlgebraPoolMintEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Mint',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Plugin"`
 */
export const useWatchAlgebraPoolPluginEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Plugin',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"PluginConfig"`
 */
export const useWatchAlgebraPoolPluginConfigEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'PluginConfig',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"Swap"`
 */
export const useWatchAlgebraPoolSwapEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'Swap',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPoolAbi}__ and `eventName` set to `"TickSpacing"`
 */
export const useWatchAlgebraPoolTickSpacingEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPoolAbi,
    eventName: 'TickSpacing',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManager =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerDomainSeparator =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'DOMAIN_SEPARATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"NONFUNGIBLE_POSITION_MANAGER_ADMINISTRATOR_ROLE"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerNonfungiblePositionManagerAdministratorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'NONFUNGIBLE_POSITION_MANAGER_ADMINISTRATOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"PERMIT_TYPEHASH"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerPermitTypehash =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'PERMIT_TYPEHASH',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"WNativeToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerWNativeToken =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'WNativeToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"balanceOf"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"factory"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'factory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"farmingApprovals"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerFarmingApprovals =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'farmingApprovals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"farmingCenter"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerFarmingCenter =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'farmingCenter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"getApproved"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerGetApproved =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'getApproved',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"isApprovedForAll"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"isApprovedOrOwner"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerIsApprovedOrOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'isApprovedOrOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"name"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerName =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'name',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"ownerOf"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerOwnerOf =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'ownerOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"poolDeployer"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerPoolDeployer =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'poolDeployer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"positions"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerPositions =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'positions',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"symbol"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerSymbol =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'symbol',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"tokenByIndex"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerTokenByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'tokenByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"tokenFarmedIn"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerTokenFarmedIn =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'tokenFarmedIn',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerTokenOfOwnerByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'tokenOfOwnerByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"tokenURI"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerTokenUri =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'tokenURI',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"totalSupply"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useReadAlgebraPositionManagerTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"algebraMintCallback"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerAlgebraMintCallback =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'algebraMintCallback',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"approve"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"approveForFarming"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerApproveForFarming =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'approveForFarming',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"burn"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerBurn =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"collect"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerCollect =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'collect',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"createAndInitializePoolIfNecessary"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerCreateAndInitializePoolIfNecessary =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'createAndInitializePoolIfNecessary',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"decreaseLiquidity"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerDecreaseLiquidity =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'decreaseLiquidity',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"increaseLiquidity"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerIncreaseLiquidity =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'increaseLiquidity',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"mint"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerMint =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"multicall"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerMulticall =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'multicall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"permit"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerPermit =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'permit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"refundNativeToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerRefundNativeToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'refundNativeToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"selfPermit"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerSelfPermit =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'selfPermit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"selfPermitAllowed"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerSelfPermitAllowed =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'selfPermitAllowed',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"selfPermitAllowedIfNecessary"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerSelfPermitAllowedIfNecessary =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'selfPermitAllowedIfNecessary',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"selfPermitIfNecessary"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerSelfPermitIfNecessary =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'selfPermitIfNecessary',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"setFarmingCenter"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerSetFarmingCenter =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'setFarmingCenter',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"sweepToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerSweepToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'sweepToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"switchFarmingStatus"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerSwitchFarmingStatus =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'switchFarmingStatus',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"transferFrom"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"unwrapWNativeToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWriteAlgebraPositionManagerUnwrapWNativeToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'unwrapWNativeToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"algebraMintCallback"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerAlgebraMintCallback =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'algebraMintCallback',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"approve"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"approveForFarming"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerApproveForFarming =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'approveForFarming',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"burn"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerBurn =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"collect"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerCollect =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'collect',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"createAndInitializePoolIfNecessary"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerCreateAndInitializePoolIfNecessary =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'createAndInitializePoolIfNecessary',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"decreaseLiquidity"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerDecreaseLiquidity =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'decreaseLiquidity',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"increaseLiquidity"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerIncreaseLiquidity =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'increaseLiquidity',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"mint"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"multicall"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerMulticall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'multicall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"permit"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'permit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"refundNativeToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerRefundNativeToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'refundNativeToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"selfPermit"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerSelfPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'selfPermit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"selfPermitAllowed"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerSelfPermitAllowed =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'selfPermitAllowed',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"selfPermitAllowedIfNecessary"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerSelfPermitAllowedIfNecessary =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'selfPermitAllowedIfNecessary',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"selfPermitIfNecessary"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerSelfPermitIfNecessary =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'selfPermitIfNecessary',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"setFarmingCenter"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerSetFarmingCenter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'setFarmingCenter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"sweepToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerSweepToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'sweepToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"switchFarmingStatus"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerSwitchFarmingStatus =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'switchFarmingStatus',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"transferFrom"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `functionName` set to `"unwrapWNativeToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useSimulateAlgebraPositionManagerUnwrapWNativeToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    functionName: 'unwrapWNativeToken',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPositionManagerAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWatchAlgebraPositionManagerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `eventName` set to `"Approval"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWatchAlgebraPositionManagerApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `eventName` set to `"ApprovalForAll"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWatchAlgebraPositionManagerApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `eventName` set to `"Collect"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWatchAlgebraPositionManagerCollectEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    eventName: 'Collect',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `eventName` set to `"DecreaseLiquidity"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWatchAlgebraPositionManagerDecreaseLiquidityEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    eventName: 'DecreaseLiquidity',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `eventName` set to `"FarmingFailed"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWatchAlgebraPositionManagerFarmingFailedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    eventName: 'FarmingFailed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `eventName` set to `"IncreaseLiquidity"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWatchAlgebraPositionManagerIncreaseLiquidityEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    eventName: 'IncreaseLiquidity',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link algebraPositionManagerAbi}__ and `eventName` set to `"Transfer"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x656D1e21C74a4abF6dDc94609dBC1F7E9D014E27)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xBB203aADbE36C125028a54584f5d48C1764317D0)
 */
export const useWatchAlgebraPositionManagerTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: algebraPositionManagerAbi,
    address: algebraPositionManagerAddress,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraQuoterAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useReadAlgebraQuoter = /*#__PURE__*/ createUseReadContract({
  abi: algebraQuoterAbi,
  address: algebraQuoterAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraQuoterAbi}__ and `functionName` set to `"WNativeToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useReadAlgebraQuoterWNativeToken =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraQuoterAbi,
    address: algebraQuoterAddress,
    functionName: 'WNativeToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraQuoterAbi}__ and `functionName` set to `"algebraSwapCallback"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useReadAlgebraQuoterAlgebraSwapCallback =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraQuoterAbi,
    address: algebraQuoterAddress,
    functionName: 'algebraSwapCallback',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraQuoterAbi}__ and `functionName` set to `"factory"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useReadAlgebraQuoterFactory = /*#__PURE__*/ createUseReadContract({
  abi: algebraQuoterAbi,
  address: algebraQuoterAddress,
  functionName: 'factory',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraQuoterAbi}__ and `functionName` set to `"poolDeployer"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useReadAlgebraQuoterPoolDeployer =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraQuoterAbi,
    address: algebraQuoterAddress,
    functionName: 'poolDeployer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraQuoterAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useWriteAlgebraQuoter = /*#__PURE__*/ createUseWriteContract({
  abi: algebraQuoterAbi,
  address: algebraQuoterAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraQuoterAbi}__ and `functionName` set to `"quoteExactInput"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useWriteAlgebraQuoterQuoteExactInput =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraQuoterAbi,
    address: algebraQuoterAddress,
    functionName: 'quoteExactInput',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraQuoterAbi}__ and `functionName` set to `"quoteExactInputSingle"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useWriteAlgebraQuoterQuoteExactInputSingle =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraQuoterAbi,
    address: algebraQuoterAddress,
    functionName: 'quoteExactInputSingle',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraQuoterAbi}__ and `functionName` set to `"quoteExactOutput"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useWriteAlgebraQuoterQuoteExactOutput =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraQuoterAbi,
    address: algebraQuoterAddress,
    functionName: 'quoteExactOutput',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraQuoterAbi}__ and `functionName` set to `"quoteExactOutputSingle"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useWriteAlgebraQuoterQuoteExactOutputSingle =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraQuoterAbi,
    address: algebraQuoterAddress,
    functionName: 'quoteExactOutputSingle',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraQuoterAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useSimulateAlgebraQuoter = /*#__PURE__*/ createUseSimulateContract(
  { abi: algebraQuoterAbi, address: algebraQuoterAddress },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraQuoterAbi}__ and `functionName` set to `"quoteExactInput"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useSimulateAlgebraQuoterQuoteExactInput =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraQuoterAbi,
    address: algebraQuoterAddress,
    functionName: 'quoteExactInput',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraQuoterAbi}__ and `functionName` set to `"quoteExactInputSingle"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useSimulateAlgebraQuoterQuoteExactInputSingle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraQuoterAbi,
    address: algebraQuoterAddress,
    functionName: 'quoteExactInputSingle',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraQuoterAbi}__ and `functionName` set to `"quoteExactOutput"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useSimulateAlgebraQuoterQuoteExactOutput =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraQuoterAbi,
    address: algebraQuoterAddress,
    functionName: 'quoteExactOutput',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraQuoterAbi}__ and `functionName` set to `"quoteExactOutputSingle"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xa8ef07AEbC64A96Ae264f3Bd5cC37fF5B28B1545)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0x5Cb13b83814f2c7896fb65D61019Ca01eD852A73)
 */
export const useSimulateAlgebraQuoterQuoteExactOutputSingle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraQuoterAbi,
    address: algebraQuoterAddress,
    functionName: 'quoteExactOutputSingle',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraRouterAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useReadAlgebraRouter = /*#__PURE__*/ createUseReadContract({
  abi: algebraRouterAbi,
  address: algebraRouterAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"WNativeToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useReadAlgebraRouterWNativeToken =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'WNativeToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"factory"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useReadAlgebraRouterFactory = /*#__PURE__*/ createUseReadContract({
  abi: algebraRouterAbi,
  address: algebraRouterAddress,
  functionName: 'factory',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"poolDeployer"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useReadAlgebraRouterPoolDeployer =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'poolDeployer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouter = /*#__PURE__*/ createUseWriteContract({
  abi: algebraRouterAbi,
  address: algebraRouterAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"algebraSwapCallback"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterAlgebraSwapCallback =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'algebraSwapCallback',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"exactInput"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterExactInput =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'exactInput',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"exactInputSingle"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterExactInputSingle =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'exactInputSingle',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"exactInputSingleSupportingFeeOnTransferTokens"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterExactInputSingleSupportingFeeOnTransferTokens =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'exactInputSingleSupportingFeeOnTransferTokens',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"exactOutput"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterExactOutput =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'exactOutput',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"exactOutputSingle"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterExactOutputSingle =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'exactOutputSingle',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"multicall"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterMulticall =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'multicall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"refundNativeToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterRefundNativeToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'refundNativeToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"selfPermit"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterSelfPermit =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'selfPermit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"selfPermitAllowed"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterSelfPermitAllowed =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'selfPermitAllowed',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"selfPermitAllowedIfNecessary"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterSelfPermitAllowedIfNecessary =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'selfPermitAllowedIfNecessary',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"selfPermitIfNecessary"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterSelfPermitIfNecessary =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'selfPermitIfNecessary',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"sweepToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterSweepToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'sweepToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"sweepTokenWithFee"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterSweepTokenWithFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'sweepTokenWithFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"unwrapWNativeToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterUnwrapWNativeToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'unwrapWNativeToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"unwrapWNativeTokenWithFee"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useWriteAlgebraRouterUnwrapWNativeTokenWithFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'unwrapWNativeTokenWithFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouter = /*#__PURE__*/ createUseSimulateContract(
  { abi: algebraRouterAbi, address: algebraRouterAddress },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"algebraSwapCallback"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterAlgebraSwapCallback =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'algebraSwapCallback',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"exactInput"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterExactInput =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'exactInput',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"exactInputSingle"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterExactInputSingle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'exactInputSingle',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"exactInputSingleSupportingFeeOnTransferTokens"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterExactInputSingleSupportingFeeOnTransferTokens =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'exactInputSingleSupportingFeeOnTransferTokens',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"exactOutput"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterExactOutput =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'exactOutput',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"exactOutputSingle"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterExactOutputSingle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'exactOutputSingle',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"multicall"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterMulticall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'multicall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"refundNativeToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterRefundNativeToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'refundNativeToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"selfPermit"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterSelfPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'selfPermit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"selfPermitAllowed"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterSelfPermitAllowed =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'selfPermitAllowed',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"selfPermitAllowedIfNecessary"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterSelfPermitAllowedIfNecessary =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'selfPermitAllowedIfNecessary',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"selfPermitIfNecessary"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterSelfPermitIfNecessary =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'selfPermitIfNecessary',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"sweepToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterSweepToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'sweepToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"sweepTokenWithFee"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterSweepTokenWithFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'sweepTokenWithFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"unwrapWNativeToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterUnwrapWNativeToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'unwrapWNativeToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraRouterAbi}__ and `functionName` set to `"unwrapWNativeTokenWithFee"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0xED31e45E6F7c508cE2b91E75e1C5182d7e1bDe69)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xFff605964840a5511f595EB970011EcBffa46b39)
 */
export const useSimulateAlgebraRouterUnwrapWNativeTokenWithFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraRouterAbi,
    address: algebraRouterAddress,
    functionName: 'unwrapWNativeTokenWithFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__
 */
export const useReadAlgebraVirtualPool = /*#__PURE__*/ createUseReadContract({
  abi: algebraVirtualPoolAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"FEE_WEIGHT_DENOMINATOR"`
 */
export const useReadAlgebraVirtualPoolFeeWeightDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'FEE_WEIGHT_DENOMINATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"RATE_CHANGE_FREQUENCY"`
 */
export const useReadAlgebraVirtualPoolRateChangeFrequency =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'RATE_CHANGE_FREQUENCY',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"currentLiquidity"`
 */
export const useReadAlgebraVirtualPoolCurrentLiquidity =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'currentLiquidity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"deactivated"`
 */
export const useReadAlgebraVirtualPoolDeactivated =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'deactivated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"dynamicRateActivated"`
 */
export const useReadAlgebraVirtualPoolDynamicRateActivated =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'dynamicRateActivated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"farmingAddress"`
 */
export const useReadAlgebraVirtualPoolFarmingAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'farmingAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"feeWeights"`
 */
export const useReadAlgebraVirtualPoolFeeWeights =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'feeWeights',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"getInnerRewardsGrowth"`
 */
export const useReadAlgebraVirtualPoolGetInnerRewardsGrowth =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'getInnerRewardsGrowth',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"globalTick"`
 */
export const useReadAlgebraVirtualPoolGlobalTick =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'globalTick',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"plugin"`
 */
export const useReadAlgebraVirtualPoolPlugin =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'plugin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"prevTimestamp"`
 */
export const useReadAlgebraVirtualPoolPrevTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'prevTimestamp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"rateLimits"`
 */
export const useReadAlgebraVirtualPoolRateLimits =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'rateLimits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"rewardRates"`
 */
export const useReadAlgebraVirtualPoolRewardRates =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'rewardRates',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"rewardReserves"`
 */
export const useReadAlgebraVirtualPoolRewardReserves =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'rewardReserves',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"ticks"`
 */
export const useReadAlgebraVirtualPoolTicks =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'ticks',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"totalRewardGrowth"`
 */
export const useReadAlgebraVirtualPoolTotalRewardGrowth =
  /*#__PURE__*/ createUseReadContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'totalRewardGrowth',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__
 */
export const useWriteAlgebraVirtualPool = /*#__PURE__*/ createUseWriteContract({
  abi: algebraVirtualPoolAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"addRewards"`
 */
export const useWriteAlgebraVirtualPoolAddRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'addRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"applyLiquidityDeltaToPosition"`
 */
export const useWriteAlgebraVirtualPoolApplyLiquidityDeltaToPosition =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'applyLiquidityDeltaToPosition',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"crossTo"`
 */
export const useWriteAlgebraVirtualPoolCrossTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'crossTo',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"deactivate"`
 */
export const useWriteAlgebraVirtualPoolDeactivate =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'deactivate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"decreaseRewards"`
 */
export const useWriteAlgebraVirtualPoolDecreaseRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'decreaseRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"distributeRewards"`
 */
export const useWriteAlgebraVirtualPoolDistributeRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'distributeRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setDynamicRateLimits"`
 */
export const useWriteAlgebraVirtualPoolSetDynamicRateLimits =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setDynamicRateLimits',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setRates"`
 */
export const useWriteAlgebraVirtualPoolSetRates =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setRates',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setWeights"`
 */
export const useWriteAlgebraVirtualPoolSetWeights =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setWeights',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"switchDynamicRate"`
 */
export const useWriteAlgebraVirtualPoolSwitchDynamicRate =
  /*#__PURE__*/ createUseWriteContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'switchDynamicRate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__
 */
export const useSimulateAlgebraVirtualPool =
  /*#__PURE__*/ createUseSimulateContract({ abi: algebraVirtualPoolAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"addRewards"`
 */
export const useSimulateAlgebraVirtualPoolAddRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'addRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"applyLiquidityDeltaToPosition"`
 */
export const useSimulateAlgebraVirtualPoolApplyLiquidityDeltaToPosition =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'applyLiquidityDeltaToPosition',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"crossTo"`
 */
export const useSimulateAlgebraVirtualPoolCrossTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'crossTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"deactivate"`
 */
export const useSimulateAlgebraVirtualPoolDeactivate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'deactivate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"decreaseRewards"`
 */
export const useSimulateAlgebraVirtualPoolDecreaseRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'decreaseRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"distributeRewards"`
 */
export const useSimulateAlgebraVirtualPoolDistributeRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'distributeRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setDynamicRateLimits"`
 */
export const useSimulateAlgebraVirtualPoolSetDynamicRateLimits =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setDynamicRateLimits',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setRates"`
 */
export const useSimulateAlgebraVirtualPoolSetRates =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setRates',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"setWeights"`
 */
export const useSimulateAlgebraVirtualPoolSetWeights =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'setWeights',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algebraVirtualPoolAbi}__ and `functionName` set to `"switchDynamicRate"`
 */
export const useSimulateAlgebraVirtualPoolSwitchDynamicRate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algebraVirtualPoolAbi,
    functionName: 'switchDynamicRate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useReadAlgerbaQuoterV2 = /*#__PURE__*/ createUseReadContract({
  abi: algerbaQuoterV2Abi,
  address: algerbaQuoterV2Address,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__ and `functionName` set to `"WNativeToken"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useReadAlgerbaQuoterV2WNativeToken =
  /*#__PURE__*/ createUseReadContract({
    abi: algerbaQuoterV2Abi,
    address: algerbaQuoterV2Address,
    functionName: 'WNativeToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__ and `functionName` set to `"algebraSwapCallback"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useReadAlgerbaQuoterV2AlgebraSwapCallback =
  /*#__PURE__*/ createUseReadContract({
    abi: algerbaQuoterV2Abi,
    address: algerbaQuoterV2Address,
    functionName: 'algebraSwapCallback',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__ and `functionName` set to `"factory"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useReadAlgerbaQuoterV2Factory =
  /*#__PURE__*/ createUseReadContract({
    abi: algerbaQuoterV2Abi,
    address: algerbaQuoterV2Address,
    functionName: 'factory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__ and `functionName` set to `"poolDeployer"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useReadAlgerbaQuoterV2PoolDeployer =
  /*#__PURE__*/ createUseReadContract({
    abi: algerbaQuoterV2Abi,
    address: algerbaQuoterV2Address,
    functionName: 'poolDeployer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useWriteAlgerbaQuoterV2 = /*#__PURE__*/ createUseWriteContract({
  abi: algerbaQuoterV2Abi,
  address: algerbaQuoterV2Address,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__ and `functionName` set to `"quoteExactInput"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useWriteAlgerbaQuoterV2QuoteExactInput =
  /*#__PURE__*/ createUseWriteContract({
    abi: algerbaQuoterV2Abi,
    address: algerbaQuoterV2Address,
    functionName: 'quoteExactInput',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__ and `functionName` set to `"quoteExactInputSingle"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useWriteAlgerbaQuoterV2QuoteExactInputSingle =
  /*#__PURE__*/ createUseWriteContract({
    abi: algerbaQuoterV2Abi,
    address: algerbaQuoterV2Address,
    functionName: 'quoteExactInputSingle',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__ and `functionName` set to `"quoteExactOutput"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useWriteAlgerbaQuoterV2QuoteExactOutput =
  /*#__PURE__*/ createUseWriteContract({
    abi: algerbaQuoterV2Abi,
    address: algerbaQuoterV2Address,
    functionName: 'quoteExactOutput',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__ and `functionName` set to `"quoteExactOutputSingle"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useWriteAlgerbaQuoterV2QuoteExactOutputSingle =
  /*#__PURE__*/ createUseWriteContract({
    abi: algerbaQuoterV2Abi,
    address: algerbaQuoterV2Address,
    functionName: 'quoteExactOutputSingle',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useSimulateAlgerbaQuoterV2 =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algerbaQuoterV2Abi,
    address: algerbaQuoterV2Address,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__ and `functionName` set to `"quoteExactInput"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useSimulateAlgerbaQuoterV2QuoteExactInput =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algerbaQuoterV2Abi,
    address: algerbaQuoterV2Address,
    functionName: 'quoteExactInput',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__ and `functionName` set to `"quoteExactInputSingle"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useSimulateAlgerbaQuoterV2QuoteExactInputSingle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algerbaQuoterV2Abi,
    address: algerbaQuoterV2Address,
    functionName: 'quoteExactInputSingle',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__ and `functionName` set to `"quoteExactOutput"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useSimulateAlgerbaQuoterV2QuoteExactOutput =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algerbaQuoterV2Abi,
    address: algerbaQuoterV2Address,
    functionName: 'quoteExactOutput',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link algerbaQuoterV2Abi}__ and `functionName` set to `"quoteExactOutputSingle"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x2f2f7197d19A13e8c72c1087dD29d555aBE76C5C)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xd83aeD10ef6c7C0bcf6693E4Ce7cAA134B52bCd2)
 */
export const useSimulateAlgerbaQuoterV2QuoteExactOutputSingle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: algerbaQuoterV2Abi,
    address: algerbaQuoterV2Address,
    functionName: 'quoteExactOutputSingle',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useReadErc20 = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const useReadErc20Name = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20TotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20Decimals = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20Symbol = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20Allowance = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWriteErc20 = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20Approve = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc20TransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErc20Transfer = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"deposit"`
 */
export const useWriteErc20Deposit = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'deposit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteErc20Withdraw = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useSimulateErc20 = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20Approve = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc20TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErc20Transfer = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc20Abi, functionName: 'transfer' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateErc20Deposit = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: 'deposit',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateErc20Withdraw = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc20Abi, functionName: 'withdraw' },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWatchErc20Event = /*#__PURE__*/ createUseWatchContractEvent({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc20ApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc20TransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link farmingCenterAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useReadFarmingCenter = /*#__PURE__*/ createUseReadContract({
  abi: farmingCenterAbi,
  address: farmingCenterAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"algebraPoolDeployer"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useReadFarmingCenterAlgebraPoolDeployer =
  /*#__PURE__*/ createUseReadContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'algebraPoolDeployer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"deposits"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useReadFarmingCenterDeposits = /*#__PURE__*/ createUseReadContract(
  {
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'deposits',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"eternalFarming"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useReadFarmingCenterEternalFarming =
  /*#__PURE__*/ createUseReadContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'eternalFarming',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"incentiveKeys"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useReadFarmingCenterIncentiveKeys =
  /*#__PURE__*/ createUseReadContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'incentiveKeys',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"nonfungiblePositionManager"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useReadFarmingCenterNonfungiblePositionManager =
  /*#__PURE__*/ createUseReadContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'nonfungiblePositionManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"virtualPoolAddresses"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useReadFarmingCenterVirtualPoolAddresses =
  /*#__PURE__*/ createUseReadContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'virtualPoolAddresses',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useWriteFarmingCenter = /*#__PURE__*/ createUseWriteContract({
  abi: farmingCenterAbi,
  address: farmingCenterAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"applyLiquidityDelta"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useWriteFarmingCenterApplyLiquidityDelta =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'applyLiquidityDelta',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"claimReward"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useWriteFarmingCenterClaimReward =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'claimReward',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"collectRewards"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useWriteFarmingCenterCollectRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'collectRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"connectVirtualPoolToPlugin"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useWriteFarmingCenterConnectVirtualPoolToPlugin =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'connectVirtualPoolToPlugin',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"disconnectVirtualPoolFromPlugin"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useWriteFarmingCenterDisconnectVirtualPoolFromPlugin =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'disconnectVirtualPoolFromPlugin',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"enterFarming"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useWriteFarmingCenterEnterFarming =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'enterFarming',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"exitFarming"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useWriteFarmingCenterExitFarming =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'exitFarming',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"multicall"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useWriteFarmingCenterMulticall =
  /*#__PURE__*/ createUseWriteContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'multicall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useSimulateFarmingCenter = /*#__PURE__*/ createUseSimulateContract(
  { abi: farmingCenterAbi, address: farmingCenterAddress },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"applyLiquidityDelta"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useSimulateFarmingCenterApplyLiquidityDelta =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'applyLiquidityDelta',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"claimReward"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useSimulateFarmingCenterClaimReward =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'claimReward',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"collectRewards"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useSimulateFarmingCenterCollectRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'collectRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"connectVirtualPoolToPlugin"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useSimulateFarmingCenterConnectVirtualPoolToPlugin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'connectVirtualPoolToPlugin',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"disconnectVirtualPoolFromPlugin"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useSimulateFarmingCenterDisconnectVirtualPoolFromPlugin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'disconnectVirtualPoolFromPlugin',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"enterFarming"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useSimulateFarmingCenterEnterFarming =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'enterFarming',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"exitFarming"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useSimulateFarmingCenterExitFarming =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'exitFarming',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link farmingCenterAbi}__ and `functionName` set to `"multicall"`
 *
 * - [__View Contract on Berachain Bepolia Berascan__](https://bepolia.beratrail.io/address/0x0000000000000000000000000000000000000000)
 * - [__View Contract on Berachain Berascan__](https://berascan.com/address/0xD8399d82eb577F223f55e81EfB96942Ce560f51f)
 */
export const useSimulateFarmingCenterMulticall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: farmingCenterAbi,
    address: farmingCenterAddress,
    functionName: 'multicall',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__
 */
export const useReadIchiVault = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"PRECISION"`
 */
export const useReadIchiVaultPrecision = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'PRECISION',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"affiliate"`
 */
export const useReadIchiVaultAffiliate = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'affiliate',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"allowToken0"`
 */
export const useReadIchiVaultAllowToken0 = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'allowToken0',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"allowToken1"`
 */
export const useReadIchiVaultAllowToken1 = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'allowToken1',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadIchiVaultAllowance = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"ammFeeRecipient"`
 */
export const useReadIchiVaultAmmFeeRecipient =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultAbi,
    functionName: 'ammFeeRecipient',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIchiVaultBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"baseLower"`
 */
export const useReadIchiVaultBaseLower = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'baseLower',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"baseUpper"`
 */
export const useReadIchiVaultBaseUpper = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'baseUpper',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"currentTick"`
 */
export const useReadIchiVaultCurrentTick = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'currentTick',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadIchiVaultDecimals = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"deposit0Max"`
 */
export const useReadIchiVaultDeposit0Max = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'deposit0Max',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"deposit1Max"`
 */
export const useReadIchiVaultDeposit1Max = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'deposit1Max',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"fee"`
 */
export const useReadIchiVaultFee = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'fee',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"getBasePosition"`
 */
export const useReadIchiVaultGetBasePosition =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultAbi,
    functionName: 'getBasePosition',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"getLimitPosition"`
 */
export const useReadIchiVaultGetLimitPosition =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultAbi,
    functionName: 'getLimitPosition',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"getTotalAmounts"`
 */
export const useReadIchiVaultGetTotalAmounts =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultAbi,
    functionName: 'getTotalAmounts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"hysteresis"`
 */
export const useReadIchiVaultHysteresis = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'hysteresis',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"ichiVaultFactory"`
 */
export const useReadIchiVaultIchiVaultFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultAbi,
    functionName: 'ichiVaultFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"limitLower"`
 */
export const useReadIchiVaultLimitLower = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'limitLower',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"limitUpper"`
 */
export const useReadIchiVaultLimitUpper = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'limitUpper',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"name"`
 */
export const useReadIchiVaultName = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"owner"`
 */
export const useReadIchiVaultOwner = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"pool"`
 */
export const useReadIchiVaultPool = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'pool',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadIchiVaultSymbol = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"tickSpacing"`
 */
export const useReadIchiVaultTickSpacing = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'tickSpacing',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"token0"`
 */
export const useReadIchiVaultToken0 = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'token0',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"token1"`
 */
export const useReadIchiVaultToken1 = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'token1',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadIchiVaultTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"twapPeriod"`
 */
export const useReadIchiVaultTwapPeriod = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultAbi,
  functionName: 'twapPeriod',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__
 */
export const useWriteIchiVault = /*#__PURE__*/ createUseWriteContract({
  abi: ichiVaultAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"algebraMintCallback"`
 */
export const useWriteIchiVaultAlgebraMintCallback =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultAbi,
    functionName: 'algebraMintCallback',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"algebraSwapCallback"`
 */
export const useWriteIchiVaultAlgebraSwapCallback =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultAbi,
    functionName: 'algebraSwapCallback',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteIchiVaultApprove = /*#__PURE__*/ createUseWriteContract({
  abi: ichiVaultAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"collectFees"`
 */
export const useWriteIchiVaultCollectFees =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultAbi,
    functionName: 'collectFees',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"decreaseAllowance"`
 */
export const useWriteIchiVaultDecreaseAllowance =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultAbi,
    functionName: 'decreaseAllowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteIchiVaultDeposit = /*#__PURE__*/ createUseWriteContract({
  abi: ichiVaultAbi,
  functionName: 'deposit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"increaseAllowance"`
 */
export const useWriteIchiVaultIncreaseAllowance =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultAbi,
    functionName: 'increaseAllowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"rebalance"`
 */
export const useWriteIchiVaultRebalance = /*#__PURE__*/ createUseWriteContract({
  abi: ichiVaultAbi,
  functionName: 'rebalance',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteIchiVaultRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"setAffiliate"`
 */
export const useWriteIchiVaultSetAffiliate =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultAbi,
    functionName: 'setAffiliate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"setAmmFeeRecipient"`
 */
export const useWriteIchiVaultSetAmmFeeRecipient =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultAbi,
    functionName: 'setAmmFeeRecipient',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"setDepositMax"`
 */
export const useWriteIchiVaultSetDepositMax =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultAbi,
    functionName: 'setDepositMax',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"setHysteresis"`
 */
export const useWriteIchiVaultSetHysteresis =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultAbi,
    functionName: 'setHysteresis',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"setTwapPeriod"`
 */
export const useWriteIchiVaultSetTwapPeriod =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultAbi,
    functionName: 'setTwapPeriod',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteIchiVaultTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: ichiVaultAbi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIchiVaultTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteIchiVaultTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteIchiVaultWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: ichiVaultAbi,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__
 */
export const useSimulateIchiVault = /*#__PURE__*/ createUseSimulateContract({
  abi: ichiVaultAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"algebraMintCallback"`
 */
export const useSimulateIchiVaultAlgebraMintCallback =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'algebraMintCallback',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"algebraSwapCallback"`
 */
export const useSimulateIchiVaultAlgebraSwapCallback =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'algebraSwapCallback',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIchiVaultApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"collectFees"`
 */
export const useSimulateIchiVaultCollectFees =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'collectFees',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"decreaseAllowance"`
 */
export const useSimulateIchiVaultDecreaseAllowance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'decreaseAllowance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateIchiVaultDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"increaseAllowance"`
 */
export const useSimulateIchiVaultIncreaseAllowance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'increaseAllowance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"rebalance"`
 */
export const useSimulateIchiVaultRebalance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'rebalance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateIchiVaultRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"setAffiliate"`
 */
export const useSimulateIchiVaultSetAffiliate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'setAffiliate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"setAmmFeeRecipient"`
 */
export const useSimulateIchiVaultSetAmmFeeRecipient =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'setAmmFeeRecipient',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"setDepositMax"`
 */
export const useSimulateIchiVaultSetDepositMax =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'setDepositMax',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"setHysteresis"`
 */
export const useSimulateIchiVaultSetHysteresis =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'setHysteresis',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"setTwapPeriod"`
 */
export const useSimulateIchiVaultSetTwapPeriod =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'setTwapPeriod',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateIchiVaultTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIchiVaultTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateIchiVaultTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateIchiVaultWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultAbi}__
 */
export const useWatchIchiVaultEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: ichiVaultAbi },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultAbi}__ and `eventName` set to `"Affiliate"`
 */
export const useWatchIchiVaultAffiliateEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultAbi,
    eventName: 'Affiliate',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultAbi}__ and `eventName` set to `"AmmFeeRecipient"`
 */
export const useWatchIchiVaultAmmFeeRecipientEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultAbi,
    eventName: 'AmmFeeRecipient',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIchiVaultApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultAbi}__ and `eventName` set to `"CollectFees"`
 */
export const useWatchIchiVaultCollectFeesEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultAbi,
    eventName: 'CollectFees',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultAbi}__ and `eventName` set to `"DeployICHIVault"`
 */
export const useWatchIchiVaultDeployIchiVaultEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultAbi,
    eventName: 'DeployICHIVault',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultAbi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchIchiVaultDepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultAbi,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultAbi}__ and `eventName` set to `"DepositMax"`
 */
export const useWatchIchiVaultDepositMaxEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultAbi,
    eventName: 'DepositMax',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultAbi}__ and `eventName` set to `"Hysteresis"`
 */
export const useWatchIchiVaultHysteresisEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultAbi,
    eventName: 'Hysteresis',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchIchiVaultOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultAbi}__ and `eventName` set to `"Rebalance"`
 */
export const useWatchIchiVaultRebalanceEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultAbi,
    eventName: 'Rebalance',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultAbi}__ and `eventName` set to `"SetTwapPeriod"`
 */
export const useWatchIchiVaultSetTwapPeriodEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultAbi,
    eventName: 'SetTwapPeriod',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIchiVaultTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultAbi}__ and `eventName` set to `"Withdraw"`
 */
export const useWatchIchiVaultWithdrawEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultAbi,
    eventName: 'Withdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__
 */
export const useReadIchiVaultFactory = /*#__PURE__*/ createUseReadContract({
  abi: ichiVaultFactoryAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"algebraFactory"`
 */
export const useReadIchiVaultFactoryAlgebraFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'algebraFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"allVaults"`
 */
export const useReadIchiVaultFactoryAllVaults =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'allVaults',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"ammFee"`
 */
export const useReadIchiVaultFactoryAmmFee =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'ammFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"ammName"`
 */
export const useReadIchiVaultFactoryAmmName =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'ammName',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"baseFee"`
 */
export const useReadIchiVaultFactoryBaseFee =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'baseFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"baseFeeSplit"`
 */
export const useReadIchiVaultFactoryBaseFeeSplit =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'baseFeeSplit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"basePluginFactory"`
 */
export const useReadIchiVaultFactoryBasePluginFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'basePluginFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"feeRecipient"`
 */
export const useReadIchiVaultFactoryFeeRecipient =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'feeRecipient',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"genKey"`
 */
export const useReadIchiVaultFactoryGenKey =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'genKey',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"getICHIVault"`
 */
export const useReadIchiVaultFactoryGetIchiVault =
  /*#__PURE__*/ createUseReadContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'getICHIVault',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"owner"`
 */
export const useReadIchiVaultFactoryOwner = /*#__PURE__*/ createUseReadContract(
  { abi: ichiVaultFactoryAbi, functionName: 'owner' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__
 */
export const useWriteIchiVaultFactory = /*#__PURE__*/ createUseWriteContract({
  abi: ichiVaultFactoryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"createICHIVault"`
 */
export const useWriteIchiVaultFactoryCreateIchiVault =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'createICHIVault',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteIchiVaultFactoryRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"setAmmFee"`
 */
export const useWriteIchiVaultFactorySetAmmFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'setAmmFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"setBaseFee"`
 */
export const useWriteIchiVaultFactorySetBaseFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'setBaseFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"setBaseFeeSplit"`
 */
export const useWriteIchiVaultFactorySetBaseFeeSplit =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'setBaseFeeSplit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"setFeeRecipient"`
 */
export const useWriteIchiVaultFactorySetFeeRecipient =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'setFeeRecipient',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteIchiVaultFactoryTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__
 */
export const useSimulateIchiVaultFactory =
  /*#__PURE__*/ createUseSimulateContract({ abi: ichiVaultFactoryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"createICHIVault"`
 */
export const useSimulateIchiVaultFactoryCreateIchiVault =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'createICHIVault',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateIchiVaultFactoryRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"setAmmFee"`
 */
export const useSimulateIchiVaultFactorySetAmmFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'setAmmFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"setBaseFee"`
 */
export const useSimulateIchiVaultFactorySetBaseFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'setBaseFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"setBaseFeeSplit"`
 */
export const useSimulateIchiVaultFactorySetBaseFeeSplit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'setBaseFeeSplit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"setFeeRecipient"`
 */
export const useSimulateIchiVaultFactorySetFeeRecipient =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'setFeeRecipient',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateIchiVaultFactoryTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ichiVaultFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultFactoryAbi}__
 */
export const useWatchIchiVaultFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: ichiVaultFactoryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `eventName` set to `"AmmFee"`
 */
export const useWatchIchiVaultFactoryAmmFeeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultFactoryAbi,
    eventName: 'AmmFee',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `eventName` set to `"BaseFee"`
 */
export const useWatchIchiVaultFactoryBaseFeeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultFactoryAbi,
    eventName: 'BaseFee',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `eventName` set to `"BaseFeeSplit"`
 */
export const useWatchIchiVaultFactoryBaseFeeSplitEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultFactoryAbi,
    eventName: 'BaseFeeSplit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `eventName` set to `"DeployICHIVaultFactory"`
 */
export const useWatchIchiVaultFactoryDeployIchiVaultFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultFactoryAbi,
    eventName: 'DeployICHIVaultFactory',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `eventName` set to `"FeeRecipient"`
 */
export const useWatchIchiVaultFactoryFeeRecipientEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultFactoryAbi,
    eventName: 'FeeRecipient',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `eventName` set to `"ICHIVaultCreated"`
 */
export const useWatchIchiVaultFactoryIchiVaultCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultFactoryAbi,
    eventName: 'ICHIVaultCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ichiVaultFactoryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchIchiVaultFactoryOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ichiVaultFactoryAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__
 */
export const useReadWrappedNative = /*#__PURE__*/ createUseReadContract({
  abi: wrappedNativeAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 */
export const useReadWrappedNativeDomainSeparator =
  /*#__PURE__*/ createUseReadContract({
    abi: wrappedNativeAbi,
    functionName: 'DOMAIN_SEPARATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadWrappedNativeAllowance =
  /*#__PURE__*/ createUseReadContract({
    abi: wrappedNativeAbi,
    functionName: 'allowance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadWrappedNativeBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: wrappedNativeAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadWrappedNativeDecimals = /*#__PURE__*/ createUseReadContract(
  { abi: wrappedNativeAbi, functionName: 'decimals' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"name"`
 */
export const useReadWrappedNativeName = /*#__PURE__*/ createUseReadContract({
  abi: wrappedNativeAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"nonces"`
 */
export const useReadWrappedNativeNonces = /*#__PURE__*/ createUseReadContract({
  abi: wrappedNativeAbi,
  functionName: 'nonces',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadWrappedNativeSymbol = /*#__PURE__*/ createUseReadContract({
  abi: wrappedNativeAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadWrappedNativeTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: wrappedNativeAbi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wrappedNativeAbi}__
 */
export const useWriteWrappedNative = /*#__PURE__*/ createUseWriteContract({
  abi: wrappedNativeAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteWrappedNativeApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: wrappedNativeAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteWrappedNativeDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: wrappedNativeAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"permit"`
 */
export const useWriteWrappedNativePermit = /*#__PURE__*/ createUseWriteContract(
  { abi: wrappedNativeAbi, functionName: 'permit' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteWrappedNativeTransfer =
  /*#__PURE__*/ createUseWriteContract({
    abi: wrappedNativeAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteWrappedNativeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: wrappedNativeAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteWrappedNativeWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: wrappedNativeAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__
 */
export const useSimulateWrappedNative = /*#__PURE__*/ createUseSimulateContract(
  { abi: wrappedNativeAbi },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateWrappedNativeApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateWrappedNativeDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"permit"`
 */
export const useSimulateWrappedNativePermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'permit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateWrappedNativeTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateWrappedNativeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wrappedNativeAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateWrappedNativeWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wrappedNativeAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__
 */
export const useWatchWrappedNativeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: wrappedNativeAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchWrappedNativeApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wrappedNativeAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchWrappedNativeDepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wrappedNativeAbi,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchWrappedNativeTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wrappedNativeAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wrappedNativeAbi}__ and `eventName` set to `"Withdrawal"`
 */
export const useWatchWrappedNativeWithdrawalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wrappedNativeAbi,
    eventName: 'Withdrawal',
  })
