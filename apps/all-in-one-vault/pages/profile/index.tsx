import CardContainer from '@/components/card-contianer/v3';
import { Copy } from '@honeypot/shared/components/Copy';
import Image from 'next/image';
import React from 'react';

export default function Profile() {
  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col justify-center items-center px-4 font-gliker">
      <CardContainer showBottomBorder={false}>
        <div className="flex justify-between items-start w-full py-3 sm:py-5 px-4 sm:px-8">
          <div className="flex flex-col gap-4 sm:gap-8">
            <div className="flex items-center gap-2 sm:gap-4">
              <Image
                width={56}
                height={56}
                alt="avatar"
                src="/images/v3/avatar.svg"
                className="stroke-1 stroke-black drop-shadow-[0_1px_0_#000] sm:w-[72px] sm:h-[72px]"
              />
              <div className="flex flex-col gap-1">
                <p className="text-2xl sm:text-3xl text-[#0D0D0D] text-shadow-[1px_2px_0_#AF7F3D] text-stroke-0.5 text-stroke-white">
                  My Account
                </p>
                <div className="flex items-center justify-between w-full text-[#4D4D4D] text-sm sm:text-base">
                  Wallet Account
                  <Copy
                    value="0x1234567890abcdef1234567890abcdef12345678"
                    className="ml-2 flex-shrink-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContainer>
    </div>
  );
}
