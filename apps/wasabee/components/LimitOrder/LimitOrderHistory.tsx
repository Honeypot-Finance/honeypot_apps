import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { VscCopy } from 'react-icons/vsc';
import { ExternalLink, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useLimitOrders, LimitOrder } from '@/lib/algebra/graphql/clients/limitOrders';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../algebra/ui/tabs';
import BigNumber from 'bignumber.js';
import { useWalletClient, usePublicClient } from 'wagmi';
import { Address } from 'viem';
import { limitOrderManagerABI } from '@honeypot/shared/lib/abis/algebra-contracts/ABIs/plugins/limitOrderManagerAbi';
import { useToastify } from '@honeypot/shared/hooks/useContractToastify';
import { Token, tickToPrice } from '@cryptoalgebra/sdk';

interface LimitOrderHistoryProps {
  poolAddress?: string;
  ownerAddress?: string;
}

type EnrichedLimitOrder = LimitOrder & {
  token0?: Token;
  token1?: Token;
  priceRange?: string;
};

const LimitOrderHistory = observer(
  ({ poolAddress, ownerAddress }: LimitOrderHistoryProps) => {
    const [openOrders, setOpenOrders] = useState<EnrichedLimitOrder[]>([]);
    const [closedOrders, setClosedOrders] = useState<EnrichedLimitOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
    const [openPage, setOpenPage] = useState(1);
    const [closedPage, setClosedPage] = useState(1);
    const [hasNextOpenPage, setHasNextOpenPage] = useState(false);
    const [hasNextClosedPage, setHasNextClosedPage] = useState(false);
    const pageSize = 10;

    const { fetchOrders } = useLimitOrders();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const [cancellingOrders, setCancellingOrders] = useState<Set<string>>(new Set());
    const [txState, setTxState] = useState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      message: '',
    });

    // Pool debugging state
    const [poolDebugInfo, setPoolDebugInfo] = useState<{
      currentTick?: number;
      initialized?: boolean;
      tickLowerLast?: number;
      tickSpacing?: number;
      poolTickSpacing?: number;
      poolPlugin?: string;
      pluginConfig?: number;
    }>({});

    useToastify({
      ...txState,
      title: txState.isLoading ? 'Cancelling Order' : txState.isSuccess ? 'Order Cancelled' : 'Cancel Failed',
    });

    const enrichOrderWithTokenData = async (
      order: LimitOrder
    ): Promise<EnrichedLimitOrder> => {
      if (!publicClient) return order;

      try {
        // Fetch token addresses and metadata from pool
        const [token0Address, token1Address] = await Promise.all([
          publicClient.readContract({
            address: order.pool as Address,
            abi: [
              {
                inputs: [],
                name: 'token0',
                outputs: [{ internalType: 'address', name: '', type: 'address' }],
                stateMutability: 'view',
                type: 'function',
              },
            ],
            functionName: 'token0',
          }),
          publicClient.readContract({
            address: order.pool as Address,
            abi: [
              {
                inputs: [],
                name: 'token1',
                outputs: [{ internalType: 'address', name: '', type: 'address' }],
                stateMutability: 'view',
                type: 'function',
              },
            ],
            functionName: 'token1',
          }),
        ]);

        // Fetch token metadata
        const erc20Abi = [
          {
            inputs: [],
            name: 'symbol',
            outputs: [{ internalType: 'string', name: '', type: 'string' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'decimals',
            outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
            stateMutability: 'view',
            type: 'function',
          },
        ];

        const [token0Symbol, token0Decimals, token1Symbol, token1Decimals] =
          await Promise.all([
            publicClient.readContract({
              address: token0Address as Address,
              abi: erc20Abi,
              functionName: 'symbol',
            }),
            publicClient.readContract({
              address: token0Address as Address,
              abi: erc20Abi,
              functionName: 'decimals',
            }),
            publicClient.readContract({
              address: token1Address as Address,
              abi: erc20Abi,
              functionName: 'symbol',
            }),
            publicClient.readContract({
              address: token1Address as Address,
              abi: erc20Abi,
              functionName: 'decimals',
            }),
          ]);

        const token0 = new Token(
          wallet.currentChainId,
          token0Address as string,
          token0Decimals as number,
          token0Symbol as string
        );
        const token1 = new Token(
          wallet.currentChainId,
          token1Address as string,
          token1Decimals as number,
          token1Symbol as string
        );

        // Calculate limit price (use tickLower as the limit execution price)
        const tickLower = Number(order.tickLower);

        console.log('Calculating limit price for order:', {
          orderId: order.id,
          tickLower,
          token0Symbol: token0.symbol,
          token1Symbol: token1.symbol,
          zeroToOne: order.zeroToOne,
        });

        const limitPrice = tickToPrice(token0, token1, tickLower);

        console.log('Limit price object:', {
          limitPrice: limitPrice.toSignificant(6),
        });

        // For limit orders, show the execution price with direction
        // zeroToOne = true means selling token0 for token1
        // zeroToOne = false means selling token1 for token0
        const priceRange = order.zeroToOne
          ? `≤ ${limitPrice.toSignificant(6)} ${token1.symbol}/${token0.symbol}`
          : `≥ ${limitPrice.invert().toSignificant(6)} ${token0.symbol}/${token1.symbol}`;

        console.log('Final limit price display:', priceRange);

        return {
          ...order,
          token0,
          token1,
          priceRange,
        };
      } catch (error) {
        console.error('Error enriching order:', error, {
          orderId: order.id,
          pool: order.pool,
        });
        return order;
      }
    };

    const fetchPoolDebugInfo = async (pool: string) => {
      if (!publicClient) return;

      try {
        const limitOrderManagerAddress = wallet.currentChain.contracts
          .limitOrderManager as Address;

        // Get current tick from pool
        const globalState = await publicClient.readContract({
          address: pool as Address,
          abi: [
            {
              inputs: [],
              name: 'globalState',
              outputs: [
                { name: 'price', type: 'uint160' },
                { name: 'tick', type: 'int24' },
                { name: 'fee', type: 'uint16' },
                { name: 'timepointIndex', type: 'uint16' },
                { name: 'communityFeeToken0', type: 'uint8' },
                { name: 'communityFeeToken1', type: 'uint8' },
              ],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'globalState',
        });

        // Get pool tick spacing directly
        const poolTickSpacing = await publicClient.readContract({
          address: pool as Address,
          abi: [
            {
              inputs: [],
              name: 'tickSpacing',
              outputs: [{ name: '', type: 'int24' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'tickSpacing',
        });

        // Get pool info from limit order manager
        const [initialized, tickLowerLast, managerTickSpacing] = await Promise.all([
          publicClient.readContract({
            address: limitOrderManagerAddress,
            abi: limitOrderManagerABI,
            functionName: 'initialized',
            args: [pool as Address],
          }),
          publicClient.readContract({
            address: limitOrderManagerAddress,
            abi: limitOrderManagerABI,
            functionName: 'tickLowerLasts',
            args: [pool as Address],
          }),
          publicClient.readContract({
            address: limitOrderManagerAddress,
            abi: limitOrderManagerABI,
            functionName: 'tickSpacings',
            args: [pool as Address],
          }),
        ]);

        const effectiveTickSpacing = Number(managerTickSpacing) === 0 ? Number(poolTickSpacing) : Number(managerTickSpacing);

        // Get pool's plugin address (try-catch for older pool versions)
        let poolPlugin: string | undefined;
        let pluginConfig: number | undefined;

        try {
          poolPlugin = await publicClient.readContract({
            address: pool as Address,
            abi: [
              {
                inputs: [],
                name: 'plugin',
                outputs: [{ name: '', type: 'address' }],
                stateMutability: 'view',
                type: 'function',
              },
            ],
            functionName: 'plugin',
          }) as string;
        } catch (error) {
          console.error('[PoolDebug] Pool does not have plugin() function:', error);
        }

        // Try to get plugin config (may not exist in older versions)
        if (poolPlugin) {
          try {
            pluginConfig = Number(await publicClient.readContract({
              address: pool as Address,
              abi: [
                {
                  inputs: [],
                  name: 'pluginConfig',
                  outputs: [{ name: '', type: 'uint8' }],
                  stateMutability: 'view',
                  type: 'function',
                },
              ],
              functionName: 'pluginConfig',
            }));
          } catch (error) {
            console.warn('[PoolDebug] Pool does not have pluginConfig() function (older Algebra version?)');
          }
        }

        setPoolDebugInfo({
          currentTick: Number((globalState as any)[1]),
          initialized: initialized as boolean,
          tickLowerLast: Number(tickLowerLast),
          tickSpacing: effectiveTickSpacing,
          poolTickSpacing: Number(poolTickSpacing),
          poolPlugin,
          pluginConfig,
        });

        console.log('[PoolDebug] Pool state:', {
          pool,
          currentTick: Number((globalState as any)[1]),
          initialized,
          tickLowerLast: Number(tickLowerLast),
          managerTickSpacing: Number(managerTickSpacing),
          poolTickSpacing: Number(poolTickSpacing),
          effectiveTickSpacing,
          poolPlugin,
          poolPluginIsZero: poolPlugin === '0x0000000000000000000000000000000000000000',
          pluginConfig,
          pluginConfigBinary: pluginConfig !== undefined ? pluginConfig.toString(2).padStart(8, '0') : 'N/A',
          limitOrderManager: limitOrderManagerAddress,
          pluginMatchesManager: poolPlugin ? poolPlugin.toLowerCase() === limitOrderManagerAddress.toLowerCase() : false,
        });
      } catch (error) {
        console.error('[PoolDebug] Error fetching pool debug info:', error);
      }
    };

    const refreshOrders = async () => {
      try {
        const [openResponse, closedResponse] = await Promise.all([
          fetchOrders(openPage, pageSize, ownerAddress, undefined, true),
          fetchOrders(closedPage, pageSize, ownerAddress, undefined, false),
        ]);

        // Enrich orders with token data
        const [enrichedOpenOrders, enrichedClosedOrders] = await Promise.all([
          Promise.all(openResponse.data.map(enrichOrderWithTokenData)),
          Promise.all(closedResponse.data.map(enrichOrderWithTokenData)),
        ]);

        setOpenOrders(enrichedOpenOrders);
        setHasNextOpenPage(openResponse.pageInfo.hasNextPage);
        setClosedOrders(enrichedClosedOrders);
        setHasNextClosedPage(closedResponse.pageInfo.hasNextPage);

        // Fetch pool debug info if we have any orders
        if (enrichedOpenOrders.length > 0 || enrichedClosedOrders.length > 0) {
          const pool =
            enrichedOpenOrders[0]?.pool || enrichedClosedOrders[0]?.pool;
          if (pool) {
            await fetchPoolDebugInfo(pool);
          }
        }
      } catch (error) {
        console.error('[LimitOrderHistory] Error refreshing orders:', error);
      }
    };

    const handleCancelOrder = async (order: EnrichedLimitOrder) => {
      if (!walletClient || !publicClient || !wallet.account) {
        setTxState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          message: 'Please connect your wallet',
        });
        return;
      }

      const limitOrderManagerAddress = wallet.currentChain.contracts
        .limitOrderManager as Address;

      if (!limitOrderManagerAddress) {
        setTxState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          message: 'Limit order manager not configured for this chain',
        });
        return;
      }

      if (!order.token0 || !order.token1) {
        setTxState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          message: 'Token data not available',
        });
        return;
      }

      setCancellingOrders((prev) => new Set(prev).add(order.id));
      setTxState({
        isLoading: true,
        isSuccess: false,
        isError: false,
        message: 'Cancelling limit order...',
      });

      try {
        const token0Address = order.token0.address;
        const token1Address = order.token1.address;

        console.log('Pool tokens:', { token0Address, token1Address });
        console.log('Order details for kill:', {
          tickLower: order.tickLower,
          tickUpper: order.tickUpper,
          liquidity: order.liquidity,
          zeroToOne: order.zeroToOne,
          pool: order.pool,
        });

        const { request } = await publicClient.simulateContract({
          address: limitOrderManagerAddress,
          abi: limitOrderManagerABI,
          functionName: 'kill',
          args: [
            {
              deployer: '0x0000000000000000000000000000000000000000' as Address,
              token0: token0Address as Address,
              token1: token1Address as Address,
            },
            Number(order.tickLower),
            Number(order.tickUpper),
            BigInt(order.liquidity),
            order.zeroToOne,
            wallet.account as Address,
          ],
          account: wallet.account as Address,
        });

        const hash = await walletClient.writeContract(request);
        console.log('Cancel transaction submitted:', hash);

        // Wait for transaction
        await publicClient.waitForTransactionReceipt({ hash });

        setTxState({
          isLoading: false,
          isSuccess: true,
          isError: false,
          message: 'Limit order cancelled successfully!',
        });

        // Refresh orders after a short delay
        setTimeout(() => {
          refreshOrders();
          setTxState({
            isLoading: false,
            isSuccess: false,
            isError: false,
            message: '',
          });
        }, 2000);
      } catch (error: any) {
        console.error('Error cancelling order:', error);
        setTxState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          message: error.shortMessage || error.message || 'Failed to cancel order',
        });
      } finally {
        setCancellingOrders((prev) => {
          const newSet = new Set(prev);
          newSet.delete(order.id);
          return newSet;
        });
      }
    };

    useEffect(() => {
      const loadOrders = async (showLoading = true) => {
        if (showLoading) {
          setLoading(true);
        }
        console.log('[LimitOrderHistory] Loading orders with params:', {
          ownerAddress,
          poolAddress,
          openPage,
          closedPage,
        });
        try {
          // Fetch open orders
          const openResponse = await fetchOrders(
            openPage,
            pageSize,
            ownerAddress,
            undefined, // Don't filter by pool for now
            true // isOpen = true
          );
          console.log('[LimitOrderHistory] Open orders response:', openResponse);

          // Fetch closed orders
          const closedResponse = await fetchOrders(
            closedPage,
            pageSize,
            ownerAddress,
            undefined, // Don't filter by pool for now
            false // isOpen = false
          );
          console.log('[LimitOrderHistory] Closed orders response:', closedResponse);

          // Enrich orders with token data and price ranges
          const [enrichedOpenOrders, enrichedClosedOrders] = await Promise.all([
            Promise.all(openResponse.data.map(enrichOrderWithTokenData)),
            Promise.all(closedResponse.data.map(enrichOrderWithTokenData)),
          ]);

          setOpenOrders(enrichedOpenOrders);
          setHasNextOpenPage(openResponse.pageInfo.hasNextPage);
          setClosedOrders(enrichedClosedOrders);
          setHasNextClosedPage(closedResponse.pageInfo.hasNextPage);

          // Fetch pool debug info if we have any orders
          if (enrichedOpenOrders.length > 0 || enrichedClosedOrders.length > 0) {
            const pool =
              enrichedOpenOrders[0]?.pool || enrichedClosedOrders[0]?.pool;
            if (pool) {
              await fetchPoolDebugInfo(pool);
            }
          }
        } catch (error) {
          console.error('[LimitOrderHistory] Error loading orders:', error);
          setOpenOrders([]);
          setClosedOrders([]);
        } finally {
          if (showLoading) {
            setLoading(false);
          }
        }
      };

      // Initial load with loading indicator
      loadOrders(true);

      // Set up polling to refresh orders every 5 seconds (without loading indicator to avoid flickering)
      const intervalId = setInterval(() => {
        console.log('[LimitOrderHistory] Auto-refreshing orders...');
        loadOrders(false);
      }, 5000);

      // Cleanup interval on unmount or dependency change
      return () => {
        clearInterval(intervalId);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openPage, closedPage, ownerAddress, poolAddress]);

    const formatTimeAgo = (timestamp: string) => {
      const now = Math.floor(Date.now() / 1000);
      const txTime = parseInt(timestamp);
      const diffInSeconds = now - txTime;

      if (diffInSeconds < 60) return `${diffInSeconds} secs ago`;
      if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} mins ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    const getOrderStatus = (order: LimitOrder) => {
      const isClosed = order.liquidity === '0';
      const isKilled = order.killed;

      if (isClosed) {
        if (isKilled) return { label: 'Cancelled', color: 'text-red-500' };
        return { label: 'Filled', color: 'text-green-500' };
      }
      return { label: 'Active', color: 'text-yellow-500' };
    };

    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
    };

    const openInExplorer = (txHash: string) => {
      let explorerUrl = 'https://etherscan.io';

      if (wallet.currentChainId === 56) {
        explorerUrl = 'https://bscscan.com';
      } else if (wallet.currentChainId === 137) {
        explorerUrl = 'https://polygonscan.com';
      } else if (wallet.currentChainId === 42161) {
        explorerUrl = 'https://arbiscan.io';
      } else if (wallet.currentChainId === 10) {
        explorerUrl = 'https://optimistic.etherscan.io';
      } else if (wallet.currentChainId === 8453) {
        explorerUrl = 'https://basescan.org';
      } else if (wallet.currentChainId === 80084) {
        explorerUrl = 'https://bartio.beratrail.io';
      } else if (wallet.currentChainId === 80094) {
        explorerUrl = 'https://berascan.com';
      }

      window.open(`${explorerUrl}/tx/${txHash}`, '_blank');
    };

    const formatLiquidity = (liquidity: string) => {
      return new BigNumber(liquidity).dividedBy(1e18).toFixed(6);
    };

    const renderOrdersTable = (orders: EnrichedLimitOrder[], isOpen: boolean) => (
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#2a2318]">
              <th className="text-left text-sm text-gray-500 font-normal pb-4 pl-2 min-w-[100px] whitespace-nowrap">
                Time
              </th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3 min-w-[120px] whitespace-nowrap">
                Pair
              </th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3 min-w-[120px] whitespace-nowrap">
                Direction
              </th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3 min-w-[100px] whitespace-nowrap">
                Liquidity
              </th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3 min-w-[180px] whitespace-nowrap">
                Price Range
              </th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3 min-w-[100px] whitespace-nowrap">
                Owner
              </th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3 min-w-[80px] whitespace-nowrap">
                Status
              </th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3 min-w-[100px] whitespace-nowrap">
                TX Hash
              </th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3 min-w-[100px] whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  <div className="flex flex-col gap-2">
                    <span>No {isOpen ? 'open' : 'closed'} orders found</span>
                    <span className="text-xs text-gray-600">
                      Chain:{' '}
                      {wallet.currentChain?.displayName ||
                        wallet.currentChain?.chain?.name ||
                        'Unknown'}{' '}
                      (ID: {wallet.currentChainId})
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`border-b border-[#2a2318] transition-colors ${
                    index % 2 === 0
                      ? 'bg-transparent hover:bg-[#0A0704]'
                      : 'bg-[#1F1409] hover:bg-[#241809]'
                  }`}
                >
                  <td className="py-4 text-sm text-white pl-2 whitespace-nowrap">
                    {formatTimeAgo(
                      order.closeTimestamp && order.closeTimestamp !== '0'
                        ? order.closeTimestamp
                        : order.placeTimestamp
                    )}
                  </td>
                  <td className="py-4 text-sm text-white px-3 whitespace-nowrap">
                    {order.token0 && order.token1
                      ? `${order.token0.symbol} / ${order.token1.symbol}`
                      : `Pool: ${order.pool.slice(0, 6)}...${order.pool.slice(-4)}`}
                  </td>
                  <td className="py-4 text-sm px-3 whitespace-nowrap">
                    <span
                      className={`${
                        order.zeroToOne ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {order.zeroToOne
                        ? `Sell ${order.token0?.symbol || 'Token0'}`
                        : `Sell ${order.token1?.symbol || 'Token1'}`}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-white font-medium px-3 whitespace-nowrap">
                    {formatLiquidity(order.liquidity)}
                  </td>
                  <td className="py-4 text-sm text-gray-400 px-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{order.priceRange || `${order.tickLower} → ${order.tickUpper}`}</span>
                      <span className="text-xs text-gray-600">Tick: {order.tickLower}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <button
                      onClick={() => copyToClipboard(order.owner)}
                      className="text-sm text-[#FFA931] hover:text-[#FFB951] flex items-center gap-1 transition-colors whitespace-nowrap"
                    >
                      {order.owner.slice(0, 6)}...
                      {order.owner.slice(-4)}
                      <VscCopy className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="py-4 px-3 whitespace-nowrap">
                    {(() => {
                      const status = getOrderStatus(order);
                      return (
                        <span className={`text-sm ${status.color}`}>
                          {status.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-4 px-3">
                    <button
                      onClick={() =>
                        openInExplorer(order.id.split('#')[0] || '')
                      }
                      className="text-sm text-white hover:text-gray-300 flex items-center gap-1 transition-colors whitespace-nowrap"
                    >
                      {order.id.split('#')[0].slice(0, 6)}...
                      {order.id.split('#')[0].slice(-4)}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="py-4 px-3">
                    {isOpen && order.liquidity !== '0' && !order.killed ? (
                      <button
                        onClick={() => handleCancelOrder(order)}
                        disabled={cancellingOrders.has(order.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                          cancellingOrders.has(order.id)
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        {cancellingOrders.has(order.id) ? 'Cancelling...' : 'Cancel'}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );

    return (
      <div className="w-full bg-[#140D06] rounded-2xl border border-[#2a2318] p-4 sm:p-6">
        {/* Pool Debug Info */}
        {(poolDebugInfo.currentTick !== undefined || poolDebugInfo.initialized !== undefined) && (
          <div className="mb-4 p-3 bg-[#1A0F06] border border-[#2a2318] rounded-lg">
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex gap-4 flex-wrap">
                <span>
                  <strong className="text-gray-300">Current Tick:</strong>{' '}
                  {poolDebugInfo.currentTick ?? 'N/A'}
                </span>
                <span>
                  <strong className="text-gray-300">Initialized:</strong>{' '}
                  <span className={poolDebugInfo.initialized ? 'text-green-500' : 'text-red-500'}>
                    {poolDebugInfo.initialized ? 'Yes' : 'No'}
                  </span>
                </span>
                <span>
                  <strong className="text-gray-300">Last Tick:</strong>{' '}
                  {poolDebugInfo.tickLowerLast ?? 'N/A'}
                </span>
                <span>
                  <strong className="text-gray-300">Tick Spacing:</strong>{' '}
                  {poolDebugInfo.tickSpacing ?? 'N/A'}
                  {poolDebugInfo.poolTickSpacing && poolDebugInfo.poolTickSpacing !== poolDebugInfo.tickSpacing && (
                    <span className="text-gray-500"> (Pool: {poolDebugInfo.poolTickSpacing})</span>
                  )}
                </span>
              </div>
              {!poolDebugInfo.initialized && (
                <div className="text-yellow-500 mt-2">
                  ⚠️ Pool not initialized in limit order manager - orders won't fill
                </div>
              )}
              {poolDebugInfo.poolPlugin && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs">
                    <strong className="text-gray-300">Pool Plugin:</strong>{' '}
                    <span className="text-gray-400 font-mono text-[10px]">
                      {poolDebugInfo.poolPlugin.slice(0, 6)}...{poolDebugInfo.poolPlugin.slice(-4)}
                    </span>
                  </div>
                  {poolDebugInfo.pluginConfig !== undefined && (
                    <div className="text-xs">
                      <strong className="text-gray-300">Plugin Config:</strong>{' '}
                      <span className="text-gray-400">
                        {poolDebugInfo.pluginConfig}
                        {' '}(AfterSwap Hook: {(poolDebugInfo.pluginConfig & 0x20) !== 0 ? (
                          <span className="text-green-500">Enabled ✓</span>
                        ) : (
                          <span className="text-red-500">Disabled ✗</span>
                        )})
                      </span>
                    </div>
                  )}
                </div>
              )}
              {poolDebugInfo.initialized && poolDebugInfo.tickLowerLast === 0 && (
                <div className="text-yellow-500 mt-2">
                  ⚠️ Last Tick is 0 - the limit order manager hasn't tracked any swaps yet. This could mean:
                  <ul className="ml-4 mt-1 list-disc">
                    <li>The pool plugin doesn't match the limit order manager</li>
                    <li>The afterSwap hook is not enabled in plugin config</li>
                    <li>No swaps have occurred since initialization</li>
                  </ul>
                </div>
              )}
              {poolDebugInfo.poolPlugin === '0x0000000000000000000000000000000000000000' && (
                <div className="text-red-500 mt-2 font-semibold">
                  ❌ CRITICAL: This pool has NO PLUGIN attached! Limit orders will NEVER fill. The pool needs to have the limit order manager set as its plugin.
                </div>
              )}
              {poolDebugInfo.poolPlugin &&
               poolDebugInfo.poolPlugin !== '0x0000000000000000000000000000000000000000' &&
               poolDebugInfo.poolPlugin.toLowerCase() !== wallet.currentChain.contracts.limitOrderManager?.toLowerCase() && (
                <div className="text-red-500 mt-2 font-semibold">
                  ❌ CRITICAL: Pool plugin is NOT the limit order manager! Current plugin: {poolDebugInfo.poolPlugin.slice(0, 10)}...
                  Expected: {wallet.currentChain.contracts.limitOrderManager?.slice(0, 10)}...
                  Limit orders will NOT fill.
                </div>
              )}
              {poolDebugInfo.pluginConfig !== undefined && (poolDebugInfo.pluginConfig & 0x20) === 0 && (
                <div className="text-red-500 mt-2 font-semibold">
                  ❌ CRITICAL: AfterSwap hook is DISABLED! Limit orders will NEVER fill. Contact pool admin to enable the afterSwap hook.
                </div>
              )}
            </div>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'open' | 'closed')}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-white">Limit Orders</h2>
            <TabsList className="bg-[#1A0F06] w-full sm:w-auto">
              <TabsTrigger
                value="open"
                className="data-[state=active]:bg-[#2A1F14] data-[state=active]:text-white text-gray-400 flex-1 sm:flex-initial"
              >
                Opened Orders
              </TabsTrigger>
              <TabsTrigger
                value="closed"
                className="data-[state=active]:bg-[#2A1F14] data-[state=active]:text-white text-gray-400 flex-1 sm:flex-initial"
              >
                Closed Orders
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="open">
            {renderOrdersTable(openOrders, true)}

            {/* Pagination for Open Orders */}
            <div className="flex items-center justify-center gap-2 mt-6 px-4">
              <button
                onClick={() => setOpenPage((p) => Math.max(1, p - 1))}
                disabled={openPage === 1 || loading}
                className="w-10 h-10 sm:w-8 sm:h-8 rounded text-gray-500 hover:text-gray-300 hover:bg-[#2a2318]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>

              <span className="text-gray-400 px-4 text-sm sm:text-base">Page {openPage}</span>

              <button
                onClick={() => setOpenPage((p) => p + 1)}
                disabled={!hasNextOpenPage || loading}
                className="w-10 h-10 sm:w-8 sm:h-8 rounded text-gray-500 hover:text-gray-300 hover:bg-[#2a2318]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </TabsContent>

          <TabsContent value="closed">
            {renderOrdersTable(closedOrders, false)}

            {/* Pagination for Closed Orders */}
            <div className="flex items-center justify-center gap-2 mt-6 px-4">
              <button
                onClick={() => setClosedPage((p) => Math.max(1, p - 1))}
                disabled={closedPage === 1 || loading}
                className="w-10 h-10 sm:w-8 sm:h-8 rounded text-gray-500 hover:text-gray-300 hover:bg-[#2a2318]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>

              <span className="text-gray-400 px-4 text-sm sm:text-base">Page {closedPage}</span>

              <button
                onClick={() => setClosedPage((p) => p + 1)}
                disabled={!hasNextClosedPage || loading}
                className="w-10 h-10 sm:w-8 sm:h-8 rounded text-gray-500 hover:text-gray-300 hover:bg-[#2a2318]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
);

export default LimitOrderHistory;
