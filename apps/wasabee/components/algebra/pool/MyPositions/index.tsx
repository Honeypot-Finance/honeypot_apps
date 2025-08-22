import { myPositionsColumns } from '@/components/algebra/common/Table/myPositionsColumns';
import { Address } from 'viem';
import MyPositionsTable from '@/components/algebra/common/Table/myPositionsTable';
import { FormattedPosition } from '@/types/algebra/types/formatted-position';
import { DynamicFormatAmount } from '@honeypot/shared';
import { useState, useEffect, useCallback } from 'react';
import PositionCard from '@/components/algebra/position/PositionCard';
import { X } from 'lucide-react';
import MyPositionsCard from './MyPositionsCard';
import { Button } from '@nextui-org/react';

// Custom hook for managing position selection and modal
const usePositionModal = (
  positions: FormattedPosition[],
  initialSelectedId?: number
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(
    initialSelectedId || null
  );
  const [position, setPosition] = useState<FormattedPosition | undefined>(
    undefined
  );

  // Update position when selectedId changes
  useEffect(() => {
    if (selectedId) {
      const foundPosition = positions.find(
        (pos) => Number(pos.id) === selectedId
      );
      setPosition(foundPosition);
      setIsOpen(!!foundPosition);
    } else {
      setIsOpen(false);
    }
  }, [selectedId, positions]);

  // Select a position
  const selectPosition = useCallback((id: number | null) => {
    setSelectedId(id);
  }, []);

  // Close the modal
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedId(null);
  }, []);

  return {
    isOpen,
    selectedId,
    position,
    selectPosition,
    closeModal,
  };
};

interface MyPositionsProps {
  positions: FormattedPosition[];
  poolId: Address | undefined;
  selectedPosition: number | undefined;
  selectPosition: (positionId: number | null) => void;
}

const MyPositions = ({
  positions,
  selectedPosition,
  selectPosition,
}: MyPositionsProps) => {
  // Use our custom hook
  const modal = usePositionModal(positions, selectedPosition);

  // Handler for position selection that updates both local and parent state
  const handlePositionSelect = useCallback(
    (positionId: number | null) => {
      modal.selectPosition(positionId);
      selectPosition(positionId);
    },
    [modal, selectPosition]
  );

  // Calculate total liquidity and fees
  const totalLiquidity = positions.reduce(
    (sum, pos) => sum + Number(pos.liquidityUSD || 0),
    0
  );
  const totalFees = positions.reduce(
    (sum, pos) => sum + Number(pos.feesUSD || 0),
    0
  );

  // Format the values
  const formattedTVL = DynamicFormatAmount({
    amount: totalLiquidity.toString(),
    decimals: 4,
    endWith: '',
  });

  const formattedFees = DynamicFormatAmount({
    amount: totalFees.toString(),
    decimals: 2,
    endWith: '',
  });

  useEffect(() => {
    console.log(positions);
  }, [positions]);

  // Close modal and update parent
  const handleCloseModal = useCallback(() => {
    modal.closeModal();
    selectPosition(null);
  }, [modal, selectPosition]);

  return (
    <div className="flex flex-col">
      {/* Main content with dashed border */}
      <div className="flex flex-col bg-[#271A0C] text-black rounded-3xl shadow-sm border border-dashed border-[#FFFFFF33]">
        {/* Summary header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-8 py-8 sm:pt-16 border-b border-gray-100 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
            <h3 className="text-xl font-bold">My Positions</h3>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <span className="text-sm sm:text-base">
                {positions.length} positions
              </span>
              <div className="flex items-center">
                <span className="text-sm sm:text-base font-medium text-[#479FFF]">
                  ${formattedTVL} TVL
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm sm:text-base font-medium text-[#F4AB36]">
                  ${formattedFees} Fees
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden min-h-[300px]">
          <MyPositionsCard
            positions={positions.filter((pos) => pos.liquidityUSD > 0)}
            selectedPosition={modal.selectedId}
            onSelectPosition={(positionId) => handlePositionSelect(positionId)}
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block min-h-[377px]">
          <MyPositionsTable
            defaultSortingID="liquidityUSD"
            columns={myPositionsColumns}
            data={positions.filter((pos) => pos.liquidityUSD > 0)}
            action={handlePositionSelect}
            selectedRow={modal.selectedId || undefined}
            showPagination={false}
          />
        </div>
      </div>

      {/* Position Details Modal */}
      {modal.isOpen && modal.position && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="relative bg-white rounded-2xl shadow-xl w-[95%] sm:w-[90%] max-w-xs sm:max-w-md md:max-w-2xl mx-auto my-8 sm:my-4 max-h-[95vh] sm:max-h-[90vh] overflow-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex justify-between items-center bg-white p-3 sm:p-4 border-b border-gray-100 rounded-t-2xl">
              <h3 className="text-lg sm:text-xl font-bold">Position Details</h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 sm:p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                aria-label="Close position details"
              >
                <X size={18} className="sm:hidden" />
                <X size={20} className="hidden sm:block" />
              </button>
            </div>

            <div className="p-3 sm:p-4">
              <PositionCard selectedPosition={modal.position} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPositions;
