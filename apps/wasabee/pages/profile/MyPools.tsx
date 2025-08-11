import PoolsList from '@/components/algebra/pools/PoolsList';
import MyAquaberaVaults from '@/components/Aquabera/VaultLists/MyVaults';
import { Tab, Tabs } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';

export const MyPools = observer(() => {
  return (
    <div className="custom-dashed-3xl w-full p-2 sm:p-6 bg-[#271A0C] relative">
      <div className="flex justify-between items-center mb-4 absolute top-5 left-4 sm:left-8 sm:top-10">
        <div className="text-xl sm:text-2xl font-bold">My Pools</div>
      </div>
      <Tabs
        classNames={{
          base: 'relative w-full',
          tabList:
            'flex rounded-2xl border border-[#202020] bg-[#271A0C] px-2 py-1 sm:px-4 sm:py-2 shadow-[4px_4px_0px_0px_#202020,-4px_4px_0px_0px_#202020] mb-6 ml-auto z-10',
          cursor:
            'bg-[#FFCD4D] border border-black shadow-[2px_2px_0px_0px_#000000] text-sm',
          panel: 'w-full',
          tabContent: '!text-white',
        }}
      >
        <Tab key="algebra" title="Pool">
          <PoolsList defaultFilter="myPools" showOptions={false} />
        </Tab>
        <Tab key="vault" title="Vault">
          <MyAquaberaVaults />
        </Tab>
      </Tabs>
    </div>
  );
});

export default MyPools;
