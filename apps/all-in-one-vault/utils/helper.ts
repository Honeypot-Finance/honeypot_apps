import { ReceiptTableData } from '@/components/Table/table.config';

// Function to calculate estimated rewards for a receipt
const calculateEstimatedRewards = (
  receiptWeight: string,
  poolReward?: bigint,
  totalWeight?: bigint
): string => {
  if (!poolReward || !totalWeight || !receiptWeight) {
    return '0.00 BGT';
  }

  try {
    // Convert receiptWeight back to original scale for calculation
    const originalReceiptWeight = parseFloat(receiptWeight) * 10000;
    const calculation =
      (BigInt(Math.floor(originalReceiptWeight)) * poolReward) / totalWeight;
    const result = Number(calculation) / 1e18; // Convert from wei to BGT

    return `${result.toFixed(6)} BGT`;
  } catch (error) {
    console.error('Error calculating table rewards:', error);
    return '0.00 BGT';
  }
};

export const transformReceiptData = (
  receipts: any[],
  poolReward?: bigint,
  totalWeight?: bigint
): ReceiptTableData[] => {
  const transformedData = receipts.map((receipt: any) => {
    const claimableAt = parseInt(receipt.claimableAt);
    const now = Math.floor(Date.now() / 1000);
    const remainingSeconds = Math.max(0, claimableAt - now);
    const isClaimable = remainingSeconds === 0;

    // Calculate cooldown display
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    const cooldownDisplay = isClaimable
      ? '00:00:00'
      : `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Determine action configuration
    let actionConfig;
    if (!isClaimable) {
      actionConfig = {
        label: 'Cooldown',
        isDisabled: true,
        className:
          'bg-gray-400 text-gray-700 px-3 py-1 rounded-md cursor-not-allowed',
        onClick: () => {},
      };
    } else if (isClaimable && !receipt.isClaimed) {
      actionConfig = {
        label: 'Claim',
        isDisabled: false,
        className:
          'px-3 py-1 rounded-md text-black cursor-pointer hover:opacity-80 transition-opacity',
        style: { background: 'rgba(255, 169, 49, 1)' },
        onClick: () => {
          console.log('Claiming receipt:', receipt.receiptId);
          // TODO: Implement actual claim functionality
        },
      };
    } else {
      actionConfig = {
        label: 'Claimed',
        isDisabled: true,
        className: 'px-3 py-1 rounded-md text-gray-600 cursor-not-allowed',
        style: { background: 'rgba(204, 204, 204, 1)' },
        onClick: () => {},
      };
    }

    const displayWeight = (
      parseFloat(receipt.receiptWeight) / 10000
    ).toString();

    return {
      id: receipt.id,
      receiptId: receipt.receiptId,
      cooldown: cooldownDisplay,
      weight: displayWeight,
      rewards: calculateEstimatedRewards(
        displayWeight,
        poolReward,
        totalWeight
      ),
      claimableAt: receipt.claimableAt,
      isClaimed: receipt.isClaimed,
      isCooldownActive: !isClaimable,
      action: actionConfig,
    };
  });

  // Sort: Active receipts (not claimed) first, then claimed receipts
  // Within each group, sort by receiptId ascending
  return transformedData.sort((a, b) => {
    // If one is claimed and the other is not, put claimed ones last
    if (a.isClaimed !== b.isClaimed) {
      return a.isClaimed ? 1 : -1;
    }

    // If both have same claim status, sort by receiptId
    return parseInt(a.receiptId) - parseInt(b.receiptId);
  });
};
