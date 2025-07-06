import { useState } from 'react';
import { Tabs, Tab } from '@nextui-org/react';
import CardContainer from '@/components/card-contianer/v3';
import Pot2PumpLeaderboard from './components/pot2pump-leaderboard';
import WasabeeLeaderboard from './components/wasabee-leaderboard';

export default function Leaderboard() {
  const [selectedTab, setSelectedTab] = useState<string>('pot2pump');

  return (
    <div className="w-full flex flex-col justify-center items-center px-4 font-gliker">
      <CardContainer className="xl:max-w-[1200px] mx-auto w-[calc(100%-32px)]">
        <div className="max-w-[1200px] w-full mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              All-in-One Leaderboard
            </h1>
            <p className="text-gray-400">
              Combined leaderboard from Pot2Pump and Wasabee
            </p>
          </div>

          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key.toString())}
            className="w-full"
            classNames={{
              tabList: 'bg-[#1a1a1a] border border-[#5C5C5C] rounded-lg',
              tab: 'text-white data-[selected=true]:text-[#FFCD4D]',
              tabContent: 'text-white',
              panel: 'pt-6',
            }}
          >
            <Tab key="pot2pump" title="Pot2Pump">
              <Pot2PumpLeaderboard />
            </Tab>
            <Tab key="wasabee" title="Wasabee">
              <WasabeeLeaderboard />
            </Tab>
          </Tabs>
        </div>
      </CardContainer>
    </div>
  );
}
