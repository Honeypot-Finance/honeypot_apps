import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import { Button } from '@/components/button/button-next';
import { useCallback, useState } from 'react';

import { ICHIVaultContract } from '@honeypot/shared';

import { Token } from '@honeypot/shared';
import { Address, maxInt256 } from 'viem';
import TokenCardV3 from '@/components/algebra/swap/TokenCard/TokenCardV3';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Currency, tryParseAmount } from '@cryptoalgebra/sdk';
import { useBalance } from 'wagmi';
import {
  useReadErc20Allowance,
  useReadErc20BalanceOf,
  useReadIchiVaultAllowToken0,
  useReadIchiVaultAllowToken1,
} from '@/wagmi-generated';
import { ContractWrite } from '@honeypot/shared';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react-lite';

interface DepositToVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: ICHIVaultContract;
  tokenA: Currency;
  tokenB: Currency;
}

export const DepositToVaultModal = observer(
  ({
    isOpen,
    onClose,
    vault,
    tokenA: propTokenA,
    tokenB: propTokenB,
  }: DepositToVaultModalProps) => {
    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');
    const [tokenA, setTokenA] = useState<Currency>(propTokenA);
    const [tokenB, setTokenB] = useState<Currency>(propTokenB);

    const tokenABalance = useReadErc20BalanceOf({
      address: vault.token0?.address as `0x${string}`,
      args: [wallet.account as `0x${string}`],
    });

    const tokenBBalance = useReadErc20BalanceOf({
      address: vault.token1?.address as `0x${string}`,
      args: [wallet.account as `0x${string}`],
    });
    const tokenAAllowance = useReadErc20Allowance({
      address: vault.token0?.address as `0x${string}`,
      args: [wallet.account as `0x${string}`, vault.address as `0x${string}`],
    });
    const tokenBAllowance = useReadErc20Allowance({
      address: vault.token1?.address as `0x${string}`,
      args: [wallet.account as `0x${string}`, vault.address as `0x${string}`],
    });

    const isTokenAAllowed = useReadIchiVaultAllowToken0({
      address: vault.address as `0x${string}`,
    });

    const isTokenBAllowed = useReadIchiVaultAllowToken1({
      address: vault.address as `0x${string}`,
    });

    const handleTypeAmountA = useCallback((value: string) => {
      setAmountA(value);
    }, []);

    const handleTypeAmountB = useCallback((value: string) => {
      setAmountB(value);
    }, []);

    const handleMaxA = useCallback(async () => {
      const balance = new BigNumber(
        tokenABalance.data?.toString() ?? 0
      ).dividedBy(10 ** tokenA.decimals);

      if (!balance) return;
      setAmountA(balance.toString());
    }, [tokenABalance]);

    const handleMaxB = useCallback(async () => {
      const balance = new BigNumber(
        tokenBBalance.data?.toString() ?? 0
      ).dividedBy(10 ** tokenB.decimals);

      if (!balance) return;
      setAmountB(balance.toString());
    }, [tokenBBalance]);

    const handleDeposit = async () => {
      if (!wallet.walletClient?.account?.address) return;
      if (!vault.token0 || !vault.token1) {
        console.error('Vault tokens not initialized');
        return;
      }

      // Check and handle token approvals
      const parsedAmountA = amountA
        ? new BigNumber(amountA)
            .multipliedBy(10 ** vault.token0.decimals)
            .toFixed(0)
        : undefined;
      const parsedAmountB = amountB
        ? new BigNumber(amountB)
            .multipliedBy(10 ** vault.token0.decimals)
            .toFixed(0)
        : undefined;

      if (!parsedAmountA && !parsedAmountB) return;

      console.log(
        parsedAmountA,
        parsedAmountB,
        tokenAAllowance.data,
        tokenBAllowance.data
      );

      if (
        parsedAmountA !== undefined &&
        tokenAAllowance.data !== undefined &&
        tokenAAllowance.data < BigInt(parsedAmountA)
      ) {
        await new ContractWrite(vault.token0.contract.write.approve, {
          action: 'Approve',
        }).call([vault.address as `0x${string}`, BigInt(maxInt256)]);
      }

      if (
        parsedAmountB !== undefined &&
        tokenBAllowance.data !== undefined &&
        tokenBAllowance.data < BigInt(parsedAmountB)
      ) {
        await new ContractWrite(vault.token1.contract.write.approve, {
          action: 'Approve',
        }).call([vault.address as `0x${string}`, BigInt(maxInt256)]);
      }

      console.log(
        BigInt(parsedAmountA?.toString() || '0'),
        BigInt(parsedAmountB?.toString() || '0'),
        wallet.account
      );
      // Perform deposit
      try {
        if (!vault.contract) {
          return;
        }
        await new ContractWrite(vault.contract.write.deposit, {
          action: 'Deposit',
          isSuccessEffect: true,
        }).call([
          BigInt(parsedAmountA?.toString() || '0'),
          BigInt(parsedAmountB?.toString() || '0'),
          wallet.account as `0x${string}`,
        ]);

        onClose(); // Close modal after successful transaction
      } catch (error) {
        console.error('Deposit failed:', error);
      }
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        classNames={{
          base: 'bg-transparent',
          wrapper: 'bg-transparent',
          closeButton:
            'absolute right-4 top-6 z-50 text-white w-8 h-8 flex items-center justify-center rounded-full',
        }}
      >
        <ModalContent className="bg-[#FFCD4D] relative overflow-hidden">
          {(onClose) => (
            <>
              <div className="bg-[url('/images/pumping/outline-border.png')] h-[50px] absolute top-0 left-0 w-full bg-contain bg-[left_-90px_top] bg-repeat-x"></div>

              <ModalHeader className="pt-14 bg-[#FFCD4D]">
                <h3 className="text-xl font-bold text-black">
                  Deposit to Vault
                </h3>
              </ModalHeader>

              <ModalBody className="px-6 bg-[#FFCD4D]">
                <div className="w-full rounded-[32px] bg-white space-y-4 px-4 py-6 custom-dashed mb-6">
                  {isTokenAAllowed.data && (
                    <TokenCardV3
                      value={amountA}
                      currency={tokenA}
                      otherCurrency={tokenB}
                      handleValueChange={handleTypeAmountA}
                      handleMaxValue={handleMaxA}
                      handleTokenSelection={setTokenA}
                      showBalance={true}
                      label=""
                      showMaxButton={true}
                      disableSelection
                    />
                  )}
                  {isTokenBAllowed.data && (
                    <TokenCardV3
                      value={amountB}
                      currency={tokenB}
                      otherCurrency={tokenA}
                      handleValueChange={handleTypeAmountB}
                      handleMaxValue={handleMaxB}
                      handleTokenSelection={setTokenB}
                      showBalance={true}
                      label=""
                      showMaxButton={true}
                      disableSelection
                    />
                  )}
                  <Button
                    className="w-full bg-[#FFCD4D] hover:bg-[#ffd666] text-black font-medium rounded-[16px] py-[18px] shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)]"
                    onPress={handleDeposit}
                    isDisabled={(!amountA && !amountB) || !wallet.account}
                  >
                    Deposit
                  </Button>
                </div>
              </ModalBody>

              <div className="bg-[url('/images/pool-detail/bottom-border.svg')] bg-left-top h-6 absolute -bottom-1 left-0 w-full bg-contain"></div>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  }
);

export default DepositToVaultModal;
