import { Currency, CurrencyAmount } from "@cryptoalgebra/sdk";
import { Address } from "viem";
import {
  useAccount,
  useContractRead,
  useReadContract,
  useWatchBlockNumber,
} from "wagmi";
import { erc20Abi } from "viem";
export function useNeedAllowance(
  currency: Currency | null | undefined,
  amount: CurrencyAmount<Currency> | undefined,
  spender: Address | undefined
) {
  const { address: account } = useAccount();

  const { data: allowance, refetch } = useReadContract({
    address: currency?.wrapped.address as Address,
    abi: erc20Abi,
    functionName: "allowance",
    args: account && spender && [account, spender],
    //watch:true
  });

  //watch block number
  const watch = useWatchBlockNumber({
    onBlockNumber: () => {
      refetch();
    },
  });

  return Boolean(
    !currency?.isNative &&
      typeof allowance === "bigint" &&
      amount &&
      amount.greaterThan(allowance.toString())
  );
}
