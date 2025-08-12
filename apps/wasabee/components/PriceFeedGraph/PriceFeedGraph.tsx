import { useState } from 'react';
import { SimplePriceFeedGraph } from './SimplePriceFeedGraph';
import AdvancedPriceFeedGraph from './AdvancedPriceFeedGraph';
import Image from 'next/image';
import CardContianer from '../CardContianer/CardContianer';
import Link from 'next/link';

const tradingViewIconUrl = '/images/icons/tradingview-icon.svg';

type GraphType = 'simple' | 'advanced';

export default function PriceFeedGraph() {
  const [graph, setGraph] = useState<GraphType>('simple');
  return (
    <CardContianer autoSize>
      <div className="grid grid-rows-[2rem,1fr,2rem] w-full h-full">
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={() => setGraph(graph === 'simple' ? 'advanced' : 'simple')}
            className={`${
              graph === 'simple'
                ? 'bg-[#2F200B] text-white'
                : 'bg-[#F8F8F8] text-[#2F200B]'
            } my-2 p-1 rounded-lg`}
          >
            <Image
              src={tradingViewIconUrl}
              alt="advanced"
              width={20}
              height={20}
            />
          </button>
        </div>
        <div className="relative w-full h-full min-h-[425px]">
          {graph === 'simple' && <SimplePriceFeedGraph />}
          {graph === 'advanced' && <AdvancedPriceFeedGraph />}
        </div>

        {/* <div className="flex justify-end">
          <Link
            href={"https://www.codex.io/"}
            target="_blank"
            className="flex p-2 gap-2 items-center"
          >
            <div>Price feed powered by </div>{" "}
            <Image
              className="h-4"
              src="/images/partners/codex_white.png"
              alt=""
              width={100}
              height={20}
            />
          </Link>
        </div> */}
      </div>
    </CardContianer>
  );
}
