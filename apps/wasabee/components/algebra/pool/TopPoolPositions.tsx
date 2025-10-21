import {
  useTopPoolPositionsQuery,
  Position_OrderBy,
  OrderDirection,
  Position,
  useSinglePoolQuery,
  usePoolFeeDataQuery,
  useNativePriceQuery,
} from '@/lib/algebra/graphql/generated/graphql';
import { useMemo, useState, useEffect } from 'react';
import { Button, Link } from '@nextui-org/react';
import { LoadingContainer } from '@/components/LoadingDisplay/LoadingDisplay';
import { DynamicFormatAmount } from '@honeypot/shared/lib/utils/formatAmount';
import { Copy } from '@/components/Copy';
import { truncate } from '@/lib/format';
import { ChevronUp, ChevronDown } from 'lucide-react';
import BigNumber from 'bignumber.js';
import { usePosition } from '@/lib/algebra/hooks/positions/usePositions';
import { Position as PositionEntity } from '@cryptoalgebra/sdk';
import { Pool } from '@cryptoalgebra/sdk';
import { getPositionAPR } from '@/lib/algebra/utils/positions/getPositionAPR';
import { Address } from 'viem';

export default function TopPoolPositions({
  poolId,
  poolEntity,
}: {
  poolId: string;
  poolEntity: Pool;
}) {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<Position_OrderBy>(
    Position_OrderBy.Liquidity
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [positionsAPRs, setPositionsAPRs] = useState<(number | undefined)[]>(
    []
  );

  // Convert sort state to GraphQL variables
  const orderBy = sortField;
  const orderDirection =
    sortDirection === 'asc' ? OrderDirection.Asc : OrderDirection.Desc;

  const { data: countData } = useTopPoolPositionsQuery({
    variables: {
      poolId,
      first: 1,
      skip: 0,
    },
  });

  const { data, loading } = useTopPoolPositionsQuery({
    variables: {
      poolId,
      orderBy,
      orderDirection,
      first: pageSize,
      skip: (page - 1) * pageSize,
    },
  });

  // Add data fetching for APR calculations
  const { data: poolInfo } = useSinglePoolQuery({
    variables: {
      poolId: poolId.toLowerCase(),
    },
  });

  const { data: poolFeeData } = usePoolFeeDataQuery({
    variables: {
      poolId: poolId.toLowerCase(),
    },
  });

  const { data: bundles } = useNativePriceQuery();
  const nativePrice = bundles?.bundles[0]?.maticPriceUSD;

  const positions = data?.positions || [];
  const totalPositions = countData?.positions?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalPositions / pageSize));

  // Calculate APRs for all positions
  useEffect(() => {
    if (
      !poolInfo?.pool ||
      !poolFeeData?.poolDayDatas ||
      !nativePrice ||
      !positions.length
    ) {
      return;
    }

    const calculateAPRs = async () => {
      const aprs = await Promise.all(
        positions.map(async (position) => {
          try {
            // Create position entity
            const positionEntity = new PositionEntity({
              pool: poolEntity,
              liquidity: position.liquidity.toString(),
              tickLower: Number(position.tickLower.tickIdx),
              tickUpper: Number(position.tickUpper.tickIdx),
            });

            const apr = await getPositionAPR(
              poolId.toLowerCase() as Address,
              positionEntity,
              poolInfo.pool,
              poolFeeData.poolDayDatas,
              nativePrice
            );

            // Ensure we return a number or undefined
            return typeof apr === 'number' ? apr : undefined;
          } catch (error) {
            console.error(
              'Error calculating APR for position:',
              position.id,
              error
            );
            return 0;
          }
        })
      );

      setPositionsAPRs(aprs);
    };

    calculateAPRs();
  }, [positions, poolInfo, poolFeeData, nativePrice, poolId, poolEntity]);

  const handleSort = (field: Position_OrderBy) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <LoadingContainer isLoading={loading}>
      <div className="w-full custom-dashed-3xl p-4 md:p-6 bg-white rounded-[24px]">
        {/* Desktop View */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="py-4 px-6 text-[#4D4D4D]">
                  <div className="flex items-center gap-2 ">
                    <span className="text-black">OWNER</span>
                  </div>
                </th>
                <th className="py-4 px-6 cursor-pointer text-[#4D4D4D]">
                  <div
                    className="flex items-center gap-2"
                    onClick={() => handleSort(Position_OrderBy.TickUpperPrice0)}
                  >
                    <span className="text-black">RANGE</span>
                    <div className="flex flex-col">
                      <ChevronUp
                        className={`h-3 w-3 ${
                          sortField === Position_OrderBy.TickUpperPrice0 &&
                          sortDirection === 'asc'
                            ? 'text-black'
                            : 'text-[#4D4D4D]'
                        }`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 ${
                          sortField === Position_OrderBy.TickUpperPrice0 &&
                          sortDirection === 'desc'
                            ? 'text-black'
                            : 'text-[#4D4D4D]'
                        }`}
                      />
                    </div>
                  </div>
                </th>
                <th className="py-4 px-6 cursor-pointer text-[#4D4D4D]">
                  <div
                    className="flex items-center gap-2"
                    onClick={() => handleSort(Position_OrderBy.Liquidity)}
                  >
                    <span className="text-black">LIQUIDITY</span>
                    <div className="flex flex-col">
                      <ChevronUp
                        className={`h-3 w-3 ${
                          sortField === Position_OrderBy.Liquidity &&
                          sortDirection === 'asc'
                            ? 'text-black'
                            : 'text-[#4D4D4D]'
                        }`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 ${
                          sortField === Position_OrderBy.Liquidity &&
                          sortDirection === 'desc'
                            ? 'text-black'
                            : 'text-[#4D4D4D]'
                        }`}
                      />
                    </div>
                  </div>
                </th>
                <th className="py-4 px-6 text-center text-[#4D4D4D]">
                  <div className="flex items-center gap-2 justify-center">
                    <span className="text-black">APR</span>
                  </div>
                </th>
                <th className="py-4 px-6 text-center text-[#4D4D4D]">
                  <div className="flex items-center gap-2 justify-center">
                    <span className="text-black">COPY POSITION</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4D4D4D]">
              {!positions.length ? (
                <tr className="hover:bg-white border-white h-full">
                  <td colSpan={5} className="h-24 text-center text-black">
                    No results.
                  </td>
                </tr>
              ) : (
                positions.map((position, index) => (
                  <PositionRow
                    key={position.id}
                    position={position as Position}
                    poolEntity={poolEntity}
                    isMobile={false}
                    apr={positionsAPRs[index]}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden w-full">
          <div className="flex justify-between mb-4">
            <div
              className="flex items-center gap-2 text-sm font-medium cursor-pointer text-[#4D4D4D]"
              onClick={() => handleSort(Position_OrderBy.TickUpperPrice0)}
            >
              <span>RANGE</span>
              <div className="flex flex-col">
                <ChevronUp
                  className={`h-3 w-3 ${
                    sortField === Position_OrderBy.TickUpperPrice0 &&
                    sortDirection === 'asc'
                      ? 'text-black'
                      : 'text-[#4D4D4D]'
                  }`}
                />
                <ChevronDown
                  className={`h-3 w-3 ${
                    sortField === Position_OrderBy.TickUpperPrice0 &&
                    sortDirection === 'desc'
                      ? 'text-black'
                      : 'text-[#4D4D4D]'
                  }`}
                />
              </div>
            </div>
            <div
              className="flex items-center gap-2 text-sm font-medium cursor-pointer text-[#4D4D4D]"
              onClick={() => handleSort(Position_OrderBy.Liquidity)}
            >
              <span>LIQUIDITY</span>
              <div className="flex flex-col">
                <ChevronUp
                  className={`h-3 w-3 ${
                    sortField === Position_OrderBy.Liquidity &&
                    sortDirection === 'asc'
                      ? 'text-black'
                      : 'text-[#4D4D4D]'
                  }`}
                />
                <ChevronDown
                  className={`h-3 w-3 ${
                    sortField === Position_OrderBy.Liquidity &&
                    sortDirection === 'desc'
                      ? 'text-black'
                      : 'text-[#4D4D4D]'
                  }`}
                />
              </div>
            </div>
          </div>

          {!positions.length ? (
            <div className="text-center py-6 text-black border-t border-[#4D4D4D]">
              No results.
            </div>
          ) : (
            <div className="space-y-4">
              {positions.map((position, index) => (
                <div
                  key={position.id}
                  className="border border-[#ECECEC] rounded-xl p-4 shadow-sm"
                >
                  <PositionRow
                    key={position.id}
                    position={position as Position}
                    poolEntity={poolEntity}
                    isMobile={true}
                    apr={positionsAPRs[index]}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              disabled={page === 1}
              onClick={() => setPage(Math.max(1, page - 1))}
              className="px-3 py-1 text-sm"
            >
              Previous
            </Button>
            <span className="text-sm text-[#4D4D4D]">
              Page {page} of {totalPages}
            </span>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              className="px-3 py-1 text-sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </LoadingContainer>
  );
}

export const PositionRow = ({
  position,
  poolEntity,
  isMobile = false,
  apr,
}: {
  position: Position;
  poolEntity: Pool;
  isMobile?: boolean;
  apr?: number | undefined;
}) => {
  const { position: positionData, loading } = usePosition(position.id);
  const positionEntity = useMemo(() => {
    if (!positionData) return null;

    return new PositionEntity({
      pool: poolEntity,
      tickLower: Number(positionData?.tickLower),
      tickUpper: Number(positionData?.tickUpper),
      liquidity: positionData?.liquidity.toString(),
    });
  }, [positionData, poolEntity]);

  // Get pool info and native price for USD calculation
  const { data: poolInfo } = useSinglePoolQuery({
    variables: {
      poolId: position.pool.id.toLowerCase(),
    },
  });

  const { data: bundles } = useNativePriceQuery();
  const nativePrice = bundles?.bundles[0]?.maticPriceUSD;

  // Calculate USD value of liquidity
  const liquidityUSD = useMemo(() => {
    if (!poolInfo?.pool || !nativePrice) return null;

    const amount0USD =
      Number(position.depositedToken0) *
      Number(poolInfo.pool.token0.derivedMatic) *
      Number(nativePrice);

    const amount1USD =
      Number(position.depositedToken1) *
      Number(poolInfo.pool.token1.derivedMatic) *
      Number(nativePrice);

    return amount0USD + amount1USD;
  }, [
    position.depositedToken0,
    position.depositedToken1,
    poolInfo?.pool,
    nativePrice,
  ]);

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium text-[#4D4D4D] mb-1 uppercase">
            Owner
          </p>
          <p className="text-black font-medium">
            {truncate(position.owner, 6)}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-[#4D4D4D] mb-1 uppercase">
            Range
          </p>
          <p className="text-black font-medium">
            {Number(position.tickUpper.price0) > Number.MAX_SAFE_INTEGER ? (
              'FULL RANGE'
            ) : (
              <>
                {DynamicFormatAmount({
                  amount: positionEntity?.token0PriceLower.toFixed(18) ?? '0',
                  decimals: 5,
                })}{' '}
                -{' '}
                {DynamicFormatAmount({
                  amount: positionEntity?.token0PriceUpper.toFixed(18) ?? '0',
                  decimals: 5,
                })}
              </>
            )}
            <br />
            <span className="text-[#6F6F6F] text-sm">
              {position.token0.symbol}/{position.token1.symbol}
            </span>
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-[#4D4D4D] mb-1 uppercase">
            Liquidity
          </p>
          <p className="text-black font-medium">
            {liquidityUSD !== null ? (
              <span
                className="text-[#479FFF] cursor-help relative group"
                title={`${DynamicFormatAmount({
                  amount: position.depositedToken0,
                  decimals: 3,
                  endWith: '',
                })} ${position.token0.symbol} + ${DynamicFormatAmount({
                  amount: position.depositedToken1,
                  decimals: 3,
                  endWith: '',
                })} ${position.token1.symbol}`}
              >
                $
                {DynamicFormatAmount({
                  amount: liquidityUSD.toString(),
                  decimals: 2,
                  endWith: '',
                })}
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                  {DynamicFormatAmount({
                    amount: position.depositedToken0,
                    decimals: 3,
                    endWith: '',
                  })}{' '}
                  {position.token0.symbol} +{' '}
                  {DynamicFormatAmount({
                    amount: position.depositedToken1,
                    decimals: 3,
                    endWith: '',
                  })}{' '}
                  {position.token1.symbol}
                </div>
              </span>
            ) : (
              'Loading...'
            )}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-[#4D4D4D] mb-1 uppercase">
            APR
          </p>
          <p className="text-black font-medium text-[#F7931A]">
            {apr ? `${apr.toFixed(2)}%` : 'Loading...'}
          </p>
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            className="w-full border border-[#2D2D2D] bg-[#FFCD4D] hover:bg-[#FFD56A] text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-3 py-2 text-sm font-medium"
            onPress={() => {
              const url = `/new-position/${position.pool.id}?leftrange=${
                positionEntity?.token0PriceLower.toFixed(18) ?? '0'
              }&rightrange=${
                positionEntity?.token0PriceUpper.toFixed(18) ?? '0'
              }`;
              window.location.href = url;
            }}
          >
            Copy Position
          </Button>
        </div>
      </div>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4 px-6 text-black">{truncate(position.owner, 6)}</td>
      <td className="py-4 px-6 text-black">
        {Number(position.tickUpper.price0) > Number.MAX_SAFE_INTEGER ? (
          'FULL RANGE'
        ) : (
          <>
            {DynamicFormatAmount({
              amount: positionEntity?.token0PriceLower.toFixed(18) ?? '0',
              decimals: 5,
            })}{' '}
            -{' '}
            {DynamicFormatAmount({
              amount: positionEntity?.token0PriceUpper.toFixed(18) ?? '0',
              decimals: 5,
            })}{' '}
          </>
        )}
        <br />
        {position.token0.symbol}/{position.token1.symbol}
      </td>
      <td className="py-4 px-6 text-black">
        {liquidityUSD !== null ? (
          <span
            className="text-[#479FFF] font-medium cursor-help relative group "
            title={`${DynamicFormatAmount({
              amount: position.depositedToken0,
              decimals: 3,
              endWith: '',
            })} ${position.token0.symbol} + ${DynamicFormatAmount({
              amount: position.depositedToken1,
              decimals: 3,
              endWith: '',
            })} ${position.token1.symbol}`}
          >
            $
            {DynamicFormatAmount({
              amount: liquidityUSD.toString(),
              decimals: 2,
              endWith: '',
              className: 'text-black',
            })}
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
              {DynamicFormatAmount({
                amount: position.depositedToken0,
                decimals: 3,
                endWith: '',
              })}{' '}
              {position.token0.symbol}
              <br />
              {DynamicFormatAmount({
                amount: position.depositedToken1,
                decimals: 3,
                endWith: '',
              })}{' '}
              {position.token1.symbol}
            </div>
          </span>
        ) : (
          'Loading...'
        )}
      </td>
      <td className="py-4 px-6 text-black text-center">
        <span className="text-[#F7931A] font-medium">
          {apr ? `${apr.toFixed(2)}%` : 'Loading...'}
        </span>
      </td>
      <td className="py-4 px-6 text-black text-center">
        <Button
          className="border border-[#2D2D2D] bg-[#FFCD4D] hover:bg-[#FFD56A] text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-3 py-1.5 text-xs"
          onClick={() => {
            const url = `/new-position/${position.pool.id}?leftrange=${
              positionEntity?.token0PriceLower.toFixed(18) ?? '0'
            }&rightrange=${
              positionEntity?.token0PriceUpper.toFixed(18) ?? '0'
            }`;
            window.location.href = url;
          }}
        >
          Copy Position
        </Button>
      </td>
    </tr>
  );
};
