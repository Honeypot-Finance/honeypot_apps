import { ColumnDef } from '@tanstack/react-table';
import { HeaderItem } from './common';
import { Address } from 'viem';
import { DynamicFeePluginIcon } from '../PluginIcons';
import { usePoolPlugins } from '@/lib/algebra/hooks/pools/usePoolPlugins';
import { Skeleton } from '@/components/ui/skeleton';
import { FarmingPluginIcon } from '../PluginIcons';
import { useCurrency } from '@/lib/algebra/hooks/common/useCurrency';
import { TokenFieldsFragment } from '@/lib/algebra/graphql/generated/graphql';
import { TokenLogo } from '@honeypot/shared';

import { Token, wallet } from '@honeypot/shared';
import {
  DynamicFormatAmount,
  formatAmountWithAlphabetSymbol,
} from '@/lib/algebra/utils/common/formatAmount';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';

interface Pair {
  token0: TokenFieldsFragment;
  token1: TokenFieldsFragment;
}

export interface Pool {
  id: Address;
  pair: Pair;
  fee: number;
  tvlUSD: number;
  poolMaxApr: number;
  poolAvgApr: number;
  avgApr: number;
  farmApr: number;
  hasActiveFarming: boolean;
  createdAtTimestamp: number;
  liquidity: any;
  token0Price: any;
  txCount: any;
  volumeUSD: any;
  unclaimedFees?: BigNumber;
}

function timeSince(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const diff = now - timestamp; // Time difference in seconds

  if (diff < 60) return `${diff}s`; // Seconds
  if (diff < 3600) return `${Math.floor(diff / 60)}m`; // Minutes
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`; // Hours
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`; // Days
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo`; // Months
  return `${Math.floor(diff / 31536000)}y`; // Years
}

const PoolPair = observer(({ pair, fee }: Pool) => {
  const token0 = pair.token0;
  const token1 = pair.token1;
  const token0Address = token0.id as Address;
  const token1Address = token1.id as Address;

  const currencyA = useCurrency(token0Address, true);
  const currencyB = useCurrency(token1Address, true);

  return (
    <div className="flex items-center gap-4 ml-2">
      <div className="flex">
        <div className="z-10">
          <TokenLogo
            size={30}
            token={Token.getToken({
              address: token0Address,
              chainId: wallet.currentChainId.toString(),
            })}
          />
        </div>
        <div className="-ml-3">
          <TokenLogo
            size={30}
            token={Token.getToken({
              address: token1Address,
              chainId: wallet.currentChainId.toString(),
            })}
          />
        </div>
      </div>

      {currencyA && currencyB ? (
        <div>{`${token0.symbol} - ${token1.symbol}`}</div>
      ) : (
        <Skeleton className="h-[20px] w-[90px] bg-card" />
      )}

      {/* <div className="bg-muted-primary text-primary-text rounded-xl px-2 py-1">{`${fee}%`}</div> */}
    </div>
  );
});

export const Plugins = ({ poolId }: { poolId: Address }) => {
  const { dynamicFeePlugin, farmingPlugin } = usePoolPlugins(poolId);

  return (
    <div className="flex gap-2">
      {dynamicFeePlugin && <DynamicFeePluginIcon />}
      {farmingPlugin && <FarmingPluginIcon />}
    </div>
  );
};


// export const poolsColumns: ColumnDef<Pool>[] = [
//   {
//     accessorKey: "pair",
//     header: () => <HeaderItem className="ml-2">Pool name</HeaderItem>,
//     cell: ({ row }) => <PoolPair {...row.original} />,
//     filterFn: (v, _, value) =>
//       [
//         v.original.pair.token0.symbol,
//         v.original.pair.token1.symbol,
//         v.original.pair.token0.name,
//         v.original.pair.token1.name,
//       ]
//         .join(" ")
//         .toLowerCase()
//         .includes(value),
//   },
//   {
//     accessorKey: "plugins",
//     header: () => <HeaderItem>Plugins</HeaderItem>,
//     cell: ({ row }) => <Plugins poolId={row.original.id} />,
//     filterFn: (v, _, value: boolean) => v.original.hasActiveFarming === value,
//   },
//   {
//     accessorKey: "tvlUSD",
//     header: ({ column }) => (
//       <HeaderItem
//         sort={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         isAsc={column.getIsSorted() === "asc"}
//       >
//         TVL
//       </HeaderItem>
//     ),
//     cell: ({ getValue }) => formatUSD.format(getValue() as number),
//   },
//   {
//     accessorKey: "volume24USD",
//     header: ({ column }) => (
//       <HeaderItem
//         sort={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         isAsc={column.getIsSorted() === "asc"}
//       >
//         Volume 24H
//       </HeaderItem>
//     ),
//     cell: ({ getValue }) => formatUSD.format(getValue() as number),
//   },
//   {
//     accessorKey: "fees24USD",
//     header: ({ column }) => (
//       <HeaderItem
//         sort={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         isAsc={column.getIsSorted() === "asc"}
//       >
//         Fees 24H
//       </HeaderItem>
//     ),
//     cell: ({ getValue }) => formatUSD.format(getValue() as number),
//   },
//   {
//     accessorKey: "avgApr",
//     header: ({ column }) => (
//       <HeaderItem
//         sort={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         isAsc={column.getIsSorted() === "asc"}
//       >
//         Avg. APR
//       </HeaderItem>
//     ),
//     cell: ({ getValue, row }) => {
//       return (
//         <AvgAPR
//           avgApr={formatPercent.format(row.original.poolAvgApr / 100)}
//           maxApr={formatPercent.format(row.original.poolMaxApr / 100)}
//           farmApr={
//             row.original.hasActiveFarming
//               ? formatPercent.format(row.original.farmApr / 100)
//               : undefined
//           }
//         >
//           {formatPercent.format((getValue() as number) / 100)}
//         </AvgAPR>
//       );
//     },
//   },
// {
//   accessorKey: "actions",
//   header: () => <></>,
//   cell: () => {
//     return (
//       <div className="space-x-2">
//         <button
//           className="border border-[#E18A20]/40 text-black rounded-lg shrink-0 p-2.5"
//           style={{
//             background:
//               "var(--f-7931-a-2-paints, linear-gradient(180deg, rgba(232, 211, 124, 0.13) 33.67%, #FCD729 132.5%), #F7931A)",
//           }}
//         >
//           Add
//         </button>
//         <button className="border border-[#E18A20]/40 bg-[#E18A20]/40 text-white rounded-lg p-2.5 shrink-0">
//           Remove
//         </button>
//       </div>
//     );
//   },
// },
//];

export const poolsColumns: ColumnDef<Pool>[] = [
  {
    accessorKey: 'pair',
    header: () => <HeaderItem className="ml-2">Pool</HeaderItem>,
    cell: ({ row }) => <PoolPair {...row.original} />,
    filterFn: (v, _, value) =>
      [
        v.original.pair.token0.symbol,
        v.original.pair.token1.symbol,
        v.original.pair.token0.name,
        v.original.pair.token1.name,
      ]
        .join(' ')
        .toLowerCase()
        .includes(value),
  },
  {
    accessorKey: 'plugins',
    header: () => <HeaderItem>Plugins</HeaderItem>,
    cell: ({ row }) => <Plugins poolId={row.original.id} />,
    filterFn: (v, _, value: boolean) => v.original.hasActiveFarming === value,
  },
  {
    accessorKey: 'fee',
    header: () => <HeaderItem className="uppercase">Fee</HeaderItem>,
    cell: ({ row }) => `${row.original.fee}%`,
  },
  {
    accessorKey: 'tvlUSD',
    id: 'tvlUSD',
    header: () => <HeaderItem className="uppercase">TVL</HeaderItem>,
    cell: ({ row }) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(row.original.tvlUSD);
    },
  },
  // {
  //   accessorKey: "createdAtTimestamp",
  //   header: () => <HeaderItem className="uppercase">Age</HeaderItem>,
  //   cell: ({ row }) => timeSince(row?.original?.createdAtTimestamp ?? 0),
  // },
  // {
  //   accessorKey: "txCount",
  //   header: () => <HeaderItem className="uppercase">txns</HeaderItem>,
  //   cell: ({ row }) => row.original.txCount,
  // },
  {
    accessorKey: 'volumeUSD',
    header: () => <HeaderItem className="uppercase">Total Volume</HeaderItem>,
    cell: ({ row }) => (
      <span>
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(row?.original?.volumeUSD)}
      </span>
    ),
  },
  // {
  //   accessorKey: "changeHour",
  //   header: () => (
  //     <HeaderItem className="uppercase">Vol Hour Change</HeaderItem>
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <span
  //         style={{ color: row.original.changeHour > 0 ? "#48bb78" : "#F56565" }}
  //       >
  //         {formatAmount(row.original.changeHour, 2)}%
  //       </span>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "change24h",
  //   header: () => <HeaderItem className="uppercase">Vol Change 24h</HeaderItem>,
  //   cell: ({ row }) => {
  //     return (
  //       <span
  //         style={{ color: row.original.change24h > 0 ? "#48bb78" : "#F56565" }}
  //       >
  //         {formatAmount(row.original.change24h, 2)}%
  //       </span>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "changeWeek",
  //   header: () => (
  //     <HeaderItem className="uppercase">Vol Change Week</HeaderItem>
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <span
  //         style={{ color: row.original.changeWeek > 0 ? "#48bb78" : "#F56565" }}
  //       >
  //         {formatAmount(row.original.changeWeek, 2)}%
  //       </span>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "changeMonth",
  //   header: () => (
  //     <HeaderItem className="uppercase">Vol Change Month</HeaderItem>
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <span
  //         style={{
  //           color: row.original.changeMonth > 0 ? "#48bb78" : "#F56565",
  //         }}
  //       >
  //         {formatAmount(row.original.changeMonth, 2)}%
  //       </span>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "liquidity",
  //   header: () => <HeaderItem className="uppercase">liquidity</HeaderItem>,
  //   cell: ({ row }) => formatAmount(row.original.liquidity),
  // },
  // {
  //   accessorKey: "pair.token0.marketCap",
  //   header: () => <HeaderItem className="uppercase">marktet cap</HeaderItem>,
  //   cell: ({ row }) => row.original.pair.token0.marketCap,
  // },
];

export const poolsColumnsMy: ColumnDef<Pool>[] = [
  {
    accessorKey: 'pair',
    header: () => <HeaderItem className="ml-2">Pool</HeaderItem>,
    cell: ({ row }) => <PoolPair {...row.original} />,
    filterFn: (v, _, value) =>
      [
        v.original.pair.token0.symbol,
        v.original.pair.token1.symbol,
        v.original.pair.token0.name,
        v.original.pair.token1.name,
      ]
        .join(' ')
        .toLowerCase()
        .includes(value),
  },
  {
    accessorKey: 'plugins',
    header: () => <HeaderItem>Plugins</HeaderItem>,
    cell: ({ row }) => <Plugins poolId={row.original.id} />,
    filterFn: (v, _, value: boolean) => v.original.hasActiveFarming === value,
  },
  {
    accessorKey: 'fee',
    header: () => <HeaderItem className="uppercase">Fee</HeaderItem>,
    cell: ({ row }) => `${row.original.fee}%`,
  },
  {
    accessorKey: 'tvlUSD',
    id: 'tvlUSD',
    header: () => <HeaderItem className="uppercase">TVL</HeaderItem>,
    cell: ({ row }) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(row.original.tvlUSD);
    },
  },
  // {
  //   accessorKey: "createdAtTimestamp",
  //   header: () => <HeaderItem className="uppercase">Age</HeaderItem>,
  //   cell: ({ row }) => timeSince(row?.original?.createdAtTimestamp ?? 0),
  // },
  // {
  //   accessorKey: "txCount",
  //   header: () => <HeaderItem className="uppercase">txns</HeaderItem>,
  //   cell: ({ row }) => row.original.txCount,
  // },
  // {
  //   accessorKey: "volumeUSD",
  //   header: () => <HeaderItem className="uppercase">Total Volume</HeaderItem>,
  //   cell: ({ row }) => (
  //     <span>
  //       {new Intl.NumberFormat("en-US", {
  //         style: "currency",
  //         currency: "USD",
  //         minimumFractionDigits: 2,
  //         maximumFractionDigits: 2,
  //       }).format(row?.original?.volumeUSD)}
  //     </span>
  //   ),
  // },
  // {
  //   accessorKey: "volume24USD",
  //   header: () => <HeaderItem className="uppercase">24h Volume</HeaderItem>,
  //   cell: ({ row }) => (
  //     <span>
  //       {new Intl.NumberFormat("en-US", {
  //         style: "currency",
  //         currency: "USD",
  //         minimumFractionDigits: 2,
  //         maximumFractionDigits: 2,
  //       }).format(row?.original?.volume24USD)}
  //     </span>
  //   ),
  // },
  {
    accessorKey: 'unclaimedFees',
    header: () => <HeaderItem className="uppercase">Unclaimed Fees</HeaderItem>,
    cell: ({ row }) =>
      DynamicFormatAmount({
        amount: row.original.unclaimedFees?.toString() ?? 0,
        decimals: 5,
        endWith: 'USD',
      }),
  },
  // {
  //   accessorKey: "changeHour",
  //   header: () => (
  //     <HeaderItem className="uppercase">Vol Hour Change</HeaderItem>
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <span
  //         style={{ color: row.original.changeHour > 0 ? "#48bb78" : "#F56565" }}
  //       >
  //         {formatAmount(row.original.changeHour, 2)}%
  //       </span>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "change24h",
  //   header: () => <HeaderItem className="uppercase">Vol Change 24h</HeaderItem>,
  //   cell: ({ row }) => {
  //     return (
  //       <span
  //         style={{ color: row.original.change24h > 0 ? "#48bb78" : "#F56565" }}
  //       >
  //         {formatAmount(row.original.change24h, 2)}%
  //       </span>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "changeWeek",
  //   header: () => (
  //     <HeaderItem className="uppercase">Vol Change Week</HeaderItem>
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <span
  //         style={{ color: row.original.changeWeek > 0 ? "#48bb78" : "#F56565" }}
  //       >
  //         {formatAmount(row.original.changeWeek, 2)}%
  //       </span>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "changeMonth",
  //   header: () => (
  //     <HeaderItem className="uppercase">Vol Change Month</HeaderItem>
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <span
  //         style={{
  //           color: row.original.changeMonth > 0 ? "#48bb78" : "#F56565",
  //         }}
  //       >
  //         {formatAmount(row.original.changeMonth, 2)}%
  //       </span>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "liquidity",
  //   header: () => <HeaderItem className="uppercase">liquidity</HeaderItem>,
  //   cell: ({ row }) => formatAmount(row.original.liquidity),
  // },
  // {
  //   accessorKey: "pair.token0.marketCap",
  //   header: () => <HeaderItem className="uppercase">marktet cap</HeaderItem>,
  //   cell: ({ row }) => row.original.pair.token0.marketCap,
  // },
];

//for hours gain maybe change it to weekly monthly yearly as in our subgraph
