import { ReceiptTableData } from "@/components/Table/table.config";

// Helper function to calculate estimated rewards
export const calculateEstimatedRewards = (
  receiptWeight: string, 
  totalWeight?: string | number, 
  poolReward?: string | number
): number => {
  if (!receiptWeight || !totalWeight || !poolReward) return 0;
  
  if (receiptWeight === '-' || receiptWeight === '0' || String(receiptWeight) === '0') return 0;
  
  try {
    const receiptWeightStr = String(receiptWeight);
    if (!/^\d+(\.\d+)?$/.test(receiptWeightStr)) {
      return 0;
    }
    
    const receiptWeightBigInt = BigInt(Math.floor(parseFloat(receiptWeightStr)));
    const totalWeightBigInt = BigInt(totalWeight);
    const poolRewardBigInt = BigInt(poolReward);
    
    if (totalWeightBigInt === BigInt(0)) {
      return 0;
    }
    
    return Number((receiptWeightBigInt * poolRewardBigInt) / totalWeightBigInt);
  } catch (error) {
    console.error('Error calculating estimated rewards:', error);
    return 0;
  }
};

export const transformReceiptData = (
  receipts: any[], 
  totalWeight?: string | number, 
  poolReward?: string | number
): ReceiptTableData[] => {
    return receipts.map((receipt: any) => {
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

      const estimatedRewards = calculateEstimatedRewards(receipt.receiptWeight, totalWeight, poolReward);
      const formattedRewards = (estimatedRewards / 1e18).toFixed(2);

      return {
        id: receipt.id,
        receiptId: receipt.receiptId,
        cooldown: cooldownDisplay,
        weight: receipt.receiptWeight,
        rewards: `${formattedRewards} BGT`,
        claimableAt: receipt.claimableAt,
        isClaimed: receipt.isClaimed,
        isCooldownActive: !isClaimable,
        action: actionConfig,
      };
    });
  };