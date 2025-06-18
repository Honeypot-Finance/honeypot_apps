import { toast } from 'react-toastify';
import { ReceiptTableData } from '@/components/Table/table.config';

export const calculateSummaryData = (
  token: string,
  amountStr: string,
  weightPerToken: number,
  totalWeight?: bigint | null,
  tokenBalance?: bigint | null
) => {
  if (!token || !amountStr || amountStr.trim() === '' || !weightPerToken) return;

  const amountValue = parseFloat(amountStr);
  
  // Return undefined for invalid amounts
  if (isNaN(amountValue) || amountValue <= 0) return;

  const receiptWeight = (weightPerToken * amountValue).toFixed(1);
  const balance = Number(tokenBalance) / 1e18;

  return {
    weightPerToken: weightPerToken.toString(),
    balance: balance.toString(),
    receiptWeight: receiptWeight,
  };
};

export const handleTokenChange = (
  token: string,
  amount: string,
  weightPerToken: number,
  totalWeight: bigint | null | undefined,
  tokenBalance: bigint | null | undefined,
  setSelectedToken: (token: string) => void,
  setInsufficientBalance: (insufficient: boolean) => void,
  setSummaryData: (data: any) => void
) => {
  setSelectedToken(token);
  setInsufficientBalance(false);

  if (token && amount && weightPerToken) {
    const newSummaryData = calculateSummaryData(
      token,
      amount,
      weightPerToken,
      totalWeight,
      tokenBalance
    );
    if (newSummaryData) {
      setSummaryData(newSummaryData);

      const amountValue = parseFloat(amount);
      const balanceValue = parseFloat(newSummaryData.balance);

      if (amountValue > balanceValue) {
        setInsufficientBalance(true);
      }
    }
  }
};

export const handleAmountChange = (
  newAmount: string,
  selectedToken: string,
  weightPerToken: number,
  totalWeight: bigint | null | undefined,
  tokenBalance: bigint | null | undefined,
  setAmount: (amount: string) => void,
  setInsufficientBalance: (insufficient: boolean) => void,
  setSummaryData: (data: any) => void
) => {
  setAmount(newAmount);

  if (selectedToken && newAmount && weightPerToken) {
    const newSummaryData = calculateSummaryData(
      selectedToken,
      newAmount,
      weightPerToken,
      totalWeight,
      tokenBalance
    );
    if (newSummaryData) {
      setSummaryData(newSummaryData);

      const amountValue = parseFloat(newAmount);
      const balanceValue = parseFloat(newSummaryData.balance);

      if (amountValue > balanceValue) {
        setInsufficientBalance(true);
        toast.error(
          `Insufficient balance! You only have ${balanceValue} ${selectedToken} tokens available.`,
          {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      } else {
        setInsufficientBalance(false);
      }
    }
  } else {
    setInsufficientBalance(false);
  }
};

export const handleCooldownComplete = (
  event: CustomEvent,
  setCurrentTableData: React.Dispatch<React.SetStateAction<ReceiptTableData[]>>
) => {
  const receiptId = event.detail;
  setCurrentTableData((prevData) =>
    prevData.map((item) => {
      if (item.id === receiptId) {
        return {
          ...item,
          isCooldownActive: false,
          cooldown: '00:00:00',
          action: {
            ...item.action,
            label: 'Claim',
            isDisabled: false,
            className:
              'bg-orange-400 hover:bg-orange-500 text-white px-2 py-1 rounded-md',
          },
        };
      }
      return item;
    })
  );
};

export const updateClaimedReceipt = (
  claimingReceiptId: string,
  setCurrentTableData: React.Dispatch<React.SetStateAction<ReceiptTableData[]>>
) => {
  setCurrentTableData((prevData) =>
    prevData.map((item) => {
      if (item.id === claimingReceiptId) {
        return {
          ...item,
          action: {
            label: 'Claimed',
            variant: 'outline' as const,
            isDisabled: true,
            className: 'bg-gray-300 text-white px-2 py-1 rounded-md',
            onClick: () =>
              console.log(`Already claimed receipt ${claimingReceiptId}`),
          },
        };
      }
      return item;
    })
  );
};

export const resetFormState = (
  setSelectedToken: (token: string) => void,
  setAmount: (amount: string) => void,
  setInsufficientBalance: (insufficient: boolean) => void,
  setSummaryData: (data: any) => void
) => {
  setSelectedToken('');
  setAmount('');
  setInsufficientBalance(false);
  setSummaryData({
    weightPerToken: '-',
    balance: '-',
    receiptWeight: '-',
  });
};
