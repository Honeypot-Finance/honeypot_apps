import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import style from './AnnouncementBar.module.css';
import announceIcon from '@/public/images/icons/announcement-icon.png';
import Image from 'next/image';

import { cn } from '@nextui-org/theme';
// import { useGetLatestPumpingTokenQuery } from '@honeypot/shared/lib/graphql/generated/graphql';
// import { useGetLatestPumpingTokenQuery } from '@/lib/algebra/graphql/generated/graphql';

interface AnnouncementBarProps {
  slogans: React.ReactNode[];
  interval: number;
}

const STORAGE_KEY = 'latest_pumping_token_id';

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  slogans: initialSlogans,
  interval,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout>();
  const [localSlogans, setLocalSlogans] = useState(initialSlogans);
  const [lastTokenId, setLastTokenId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || '';
    }
    return '';
  });

  // const { data: latestPumpingToken, refetch } = useGetLatestPumpingTokenQuery({
  //   pollInterval: 10000, // 10 seconds
  // });

  const handleClose = () => {
    setIsVisible(false);
    if (timer) {
      clearInterval(timer);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="w-full bg-[#FFCD4D]/80 relative p-2 h-[66px]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="flex relative items-center justify-center gap-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image src={announceIcon} alt="" width={60} height={60} />
              <div
                className={cn(
                  style['arrow_box'],
                  'hover:scale-105 transition-all relative'
                )}
              >
                {localSlogans[currentIndex]}
                <button
                  onClick={handleClose}
                  className="absolute -top-1.5 -right-1.5 size-4 rounded-full border border-[#523914]/30 bg-[#523914] flex items-center justify-center hover:bg-gray-100"
                >
                  <span className="text-white text-base leading-none">
                    &times;
                  </span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementBar;
