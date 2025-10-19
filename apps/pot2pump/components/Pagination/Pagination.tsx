import { defaultContainerVariants, itemPopUpVariants } from '@/lib/animation';
import { Button } from '../button';
import { motion } from 'framer-motion';
import { IndexerPaginationState } from '@honeypot/shared/lib/utils/utils';
import { observer } from 'mobx-react-lite';
import HoneyStickSvg from '../svg/HoneyStick';
import { cn } from '@nextui-org/react';
import { DataContainer, DataContainerProps } from '../DataContainer';

type PaginationProps<FilterT extends Record<string, any>, ItemT> = {
  paginationState: IndexerPaginationState<FilterT, ItemT>;
  render: (item: ItemT) => React.ReactNode;
  classNames?: {
    base?: string;
    itemsContainer?: string;
    item?: string;
  };
};

export const Pagination = observer(
  <FilterT extends Record<string, any>, ItemT>(
    props: PaginationProps<FilterT, ItemT> &
      Omit<DataContainerProps, 'children'>
  ) => {
    return (
      <div className={cn('overflow-hidden', props.classNames?.base)}>
        <DataContainer
          isLoading={props.paginationState.isLoading}
          isInit={props.paginationState.isInit}
          hasData={!!props.paginationState.pageItems.value.length}
        >
          {props.paginationState.isInit && (
            <div>
              <motion.div
                variants={defaultContainerVariants}
                initial="hidden"
                animate="visible"
                className={props.classNames?.itemsContainer ?? ''}
              >
                {props.paginationState.pageItems.value.map((pair, idx) => (
                  <motion.div key={idx} variants={itemPopUpVariants}>
                    {props.render(pair)}
                  </motion.div>
                ))}
              </motion.div>
              <div className="flex justify-around my-5">
                {props.paginationState.filter?.hasNextPage && (
                  <Button
                    onPress={() => {
                      props.paginationState.loadMore();
                    }}
                    isDisabled={props.paginationState.isLoading}
                  >
                    {props.paginationState.isLoading
                      ? 'Loading...'
                      : 'Load More'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DataContainer>
      </div>
    );
  }
);

export default Pagination;
