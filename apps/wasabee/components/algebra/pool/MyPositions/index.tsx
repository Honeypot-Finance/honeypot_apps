import { myPositionsColumns } from '@/components/algebra/common/Table/myPositionsColumns';
import { Address } from 'viem';
import MyPositionsTable from '@/components/algebra/common/Table/myPositionsTable';
import { FormattedPosition } from '@/types/algebra/types/formatted-position';
import { DynamicFormatAmount } from '@honeypot/shared/lib/utils/formatAmount';
import { useState, useEffect, useCallback } from 'react';
import PositionCard from '@/components/algebra/position/PositionCard';
import { X } from 'lucide-react';
import MyPositionsCard from './MyPositionsCard';
import { Button } from '@nextui-org/react';

// Custom hook for managing position selection and modal
const usePositionModal = (
  positions: FormattedPosition[],
  initialSelectedId?: number | bigint
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | bigint | null>(
    initialSelectedId || null
  );
  const [position, setPosition] = useState<FormattedPosition | undefined>(
    undefined
  );

  // Update selectedId when initialSelectedId changes from parent
  useEffect(() => {
    console.log('usePositionModal - initialSelectedId changed to:', initialSelectedId);
    setSelectedId(initialSelectedId || null);
  }, [initialSelectedId]);

  // Update position when selectedId changes
  useEffect(() => {
    console.log('usePositionModal - selectedId:', selectedId, typeof selectedId);
    console.log('usePositionModal - positions:', positions);
    if (selectedId !== null && selectedId !== undefined) {
      const foundPosition = positions.find(
        (pos) => {
          const posId = typeof pos.id === 'bigint' ? Number(pos.id) : Number(pos.id);
          const compareId = typeof selectedId === 'bigint' ? Number(selectedId) : selectedId;
          console.log('Comparing posId:', posId, 'with selectedId:', compareId);
          return posId === compareId;
        }
      );
      console.log('usePositionModal - foundPosition:', foundPosition);
      setPosition(foundPosition);
      setIsOpen(!!foundPosition);
    } else {
      setIsOpen(false);
      setPosition(undefined);
    }
  }, [selectedId, positions]);

  // Select a position
  const selectPosition = useCallback((id: number | bigint | null) => {
    console.log('selectPosition called with:', id, typeof id);
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
  farming?: any;
  closedFarmings?: any;
}

const MyPositions = ({
  positions,
  selectedPosition,
  selectPosition,
  farming,
  closedFarmings,
}: MyPositionsProps) => {
  // Use our custom hook
  const modal = usePositionModal(positions, selectedPosition);

  // Handler for position selection that updates both local and parent state
  const handlePositionSelect = useCallback(
    (positionId: number | bigint | null) => {
      console.log('handlePositionSelect called with:', positionId, typeof positionId);
      modal.selectPosition(positionId);
      selectPosition(positionId as any);
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
    console.log('MyPositions - positions:', positions);
    console.log('MyPositions - modal.isOpen:', modal.isOpen);
    console.log('MyPositions - modal.position:', modal.position);
    console.log('MyPositions - modal.selectedId:', modal.selectedId);
  }, [positions, modal.isOpen, modal.position, modal.selectedId]);

  // Close modal and update parent
  const handleCloseModal = useCallback(() => {
    modal.closeModal();
    selectPosition(null);
  }, [modal, selectPosition]);

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Positions List - Always half width on desktop */}
      <div className="flex flex-col bg-[#140E06] text-white rounded-lg border border-[#3B2712] lg:w-1/2">
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

      {/* Position Details Card - Always visible on desktop, half width */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#140E06] rounded-lg border border-[#3B2712] p-6 overflow-auto">
        {modal.isOpen && modal.position ? (
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Position Details</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full bg-[#271A0C] text-white hover:bg-[#3B2712] transition-all duration-200"
                aria-label="Close position details"
              >
                <X size={20} />
              </button>
            </div>
            <PositionCard
              selectedPosition={modal.position}
              farming={farming}
              closedFarmings={closedFarmings}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full text-gray-400">
            Select a position to view details
          </div>
        )}
      </div>

      {/* Mobile Modal */}
      {modal.isOpen && modal.position && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="relative bg-[#140E06] rounded-lg shadow-xl w-[95%] mx-auto my-8 max-h-[95vh] overflow-auto animate-slide-up border border-[#3B2712]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex justify-between items-center bg-[#140E06] p-4 border-b border-[#3B2712] rounded-t-lg">
              <h3 className="text-lg font-bold text-white">Position Details</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full bg-[#271A0C] text-white hover:bg-[#3B2712] transition-all duration-200"
                aria-label="Close position details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              <PositionCard
              selectedPosition={modal.position}
              farming={farming}
              closedFarmings={closedFarmings}
            />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPositions;
