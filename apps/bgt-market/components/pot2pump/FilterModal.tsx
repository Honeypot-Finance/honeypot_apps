import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import { Pot2PumpPumpingService } from '@/services/launchpad/pot2pump/pumping';
import { Pot2PumpPumpingService as Pot2PumpService } from '@/services/launchpad/pot2pump/pot2Pump';
import { Button } from '@/components/button/v3';
import { FaSlidersH } from 'react-icons/fa';
import { FilterState } from '@/constants/pot2pump.type';
import FilterRangeItem from './components/FilterRangeItem';
import { defaultFilterState } from '@/constants/pot2pump';
import { useState, useEffect } from 'react';
import FilterTokenItem from './components/FilterTokenItem';

import { Token } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';

interface FilterProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  pumpingProjects?: Pot2PumpPumpingService | Pot2PumpService;
  filtersList: {
    key: number;
    label: string;
    category: keyof FilterState;
  }[];
}

type category = keyof FilterState;

export const Filter = observer(
  ({ filters, setFilters, pumpingProjects, filtersList }: FilterProps) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [filterState, setFilterState] = useState<FilterState>(filters);
    const [staticTokenList, setStaticTokenList] = useState<Token[]>([]);

    useEffect(() => {
      if (!wallet.isInit) return;

      const raiseTokens = wallet.currentChain.raisedTokenData.map((token) =>
        Token.getToken({
          chainId: wallet.currentChainId.toString(),
          address: token.address,
          force: true,
        })
      );

      setStaticTokenList(raiseTokens);
    }, [wallet.isInit]);

    const onChange =
      (category: category) =>
      (e: React.ChangeEvent<HTMLInputElement> | Token) => {
        if (e instanceof Token) {
          setFilterState((prev) => ({
            ...prev,
            [category]: {
              ...prev[category],
              token: e,
            },
          }));
        } else {
          const regex = /^\d*\.?\d*$/;
          if (regex.test(e.target.value)) {
            setFilterState((prev) => ({
              ...prev,
              [category]: {
                ...prev[category],
                [e.target.name]: e.target.value,
              },
            }));
          }
        }
      };

    return (
      <>
        <Button onPress={onOpen}>
          <FaSlidersH className="!text-black size-4" />
        </Button>

        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          hideCloseButton={true}
          classNames={{
            base: 'bg-transparent',
            wrapper: 'bg-transparent',
            closeButton:
              'absolute right-4 top-6 z-50 text-white w-8 h-8 flex items-center justify-center',
          }}
        >
          <ModalContent className="bg-[#FFCD4D] relative overflow-hidden">
            {(onClose) => (
              <>
                <div className="bg-[url('/images/pumping/outline-border.png')] h-[50px] absolute top-0 left-0 w-full bg-contain bg-[left_-90px_top] bg-repeat-x"></div>

                <ModalHeader className="pt-14 bg-[#FFCD4D] flex justify-between items-center">
                  <h3 className="text-xl font-bold text-black">
                    Customize Filters
                  </h3>
                  <div
                    className="!font-normal text-black cursor-pointer p-1"
                    onClick={() => {
                      setFilterState(defaultFilterState);
                      onOpenChange();
                    }}
                  >
                    x
                  </div>
                </ModalHeader>

                <ModalBody className="px-6 bg-[#FFCD4D]">
                  <div className="w-full rounded-[32px] bg-white space-y-4 px-4 py-6 custom-dashed h-[60vh] overflow-auto">
                    {filtersList.map((filter) => {
                      const filterField = filterState[filter.category];
                      console.log(filterField);

                      if (filterField?.inputType === 'range') {
                        return (
                          <FilterRangeItem
                            key={filter.key}
                            label={filter.label}
                            onChange={onChange(filter.category)}
                            min={filterField.min}
                            max={filterField.max}
                          />
                        );
                      } else if (filterField?.inputType === 'token') {
                        return (
                          <FilterTokenItem
                            key={filter.key}
                            label={filter.label}
                            onChange={onChange(filter.category)}
                            token={filterField.token}
                            staticTokenList={staticTokenList}
                          />
                        );
                      }
                    })}
                  </div>
                </ModalBody>

                <ModalFooter className="pb-10 bg-[#FFCD4D]">
                  <Button
                    className="w-full"
                    onPress={() => {
                      setFilters(filterState);
                      onClose();
                    }}
                  >
                    Apply
                  </Button>
                </ModalFooter>

                <div className="bg-[url('/images/card-container/honey/bottom-border.svg')] bg-left-top h-6 absolute -bottom-1 left-0 w-full bg-contain"></div>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  }
);
