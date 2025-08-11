import { wallet } from '@honeypot/shared/lib/wallet';
import { useReadAlgebraPositionManagerTokenUri } from '@honeypot/shared/wagmi-generated';
import { ExternalLinkIcon } from 'lucide-react';
import { useObserver } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';

interface PositionNFTProps {
  positionId: number;
}

const PositionNFT = ({ positionId }: PositionNFTProps) => {
  const { data: uri } = useReadAlgebraPositionManagerTokenUri({
    args: positionId ? [BigInt(positionId)] : undefined,
  });
  const ALGEBRA_POSITION_MANAGER = useObserver(
    () => wallet.currentChain.contracts.algebraPositionManager
  );

  const imgRef = useRef<any>();

  const json =
    uri && JSON.parse(atob(uri.slice('data:application/json;base64,'.length)));

  const openSeaLink = `${wallet.currentChain.chain.blockExplorers?.default.url}/nft/${ALGEBRA_POSITION_MANAGER}/${positionId}`;

  useEffect(() => {
    if (!imgRef?.current || !json) return;

    imgRef.current.src = json.image;
  }, [imgRef, json]);

  return (
    <div className="inline-block relative w-[160px] h-[280px] overflow-hidden ">
      {json ? (
        <img ref={imgRef} className="absolute w-full" />
      ) : (
        <div className="w-full h-full bg-white/10"></div>
      )}
      {json && (
        <div className="absolute w-full h-full flex items-center justify-center duration-200 bg-black/40 opacity-0 hover:opacity-100 rounded-xl">
          <a
            href={openSeaLink}
            target={'_blank'}
            rel={'noreferrer noopener'}
            className="inline-flex  hover:bg-gray-600/60 rounded-xl"
          >
            <span className="font-semibold">OpenSea</span>
            <ExternalLinkIcon />
          </a>
        </div>
      )}
    </div>
  );
};

export default PositionNFT;
