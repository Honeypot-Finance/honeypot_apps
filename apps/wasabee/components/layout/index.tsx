/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import { useEffect, useState } from 'react';
import { Header } from './header/v3';
import { useRouter } from 'next/router';
import { cn } from '@/lib/tailwindcss';
import NotConnetctedDisplay from '../NotConnetctedDisplay/NotConnetctedDisplay';
import ConfettiComponent from '../atoms/Confetti/Confetti';
import PopOverModal from '../PopOverModal/PopOverModal';
import { trpcClient } from '@/lib/trpc';
import { popmodal } from '@/services/popmodal';
import { metadata } from '@/config/metadata';
import AnnouncementBar from './AnnouncementBar';
import Link from 'next/link';
import ChatWidget from '../ServiceChat';
import Script from 'next/script';
import { Footer } from './footer';
import { chatService, presetQuestions, questionTitles } from '@/services/chat';
import _ from 'lodash';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useObserver } from 'mobx-react-lite';

export const Layout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const router = useRouter();
  const currentchain = useObserver(() => wallet.currentChain);
  const [showInviteModal, setShowInviteModal] = useState(false);

  console.log('currentchain', currentchain);

  useEffect(() => {
    //if its user first time visit, open chat
    const questions = chatService.findRelatedQuestionsByPath(router.pathname);
    const pageVisited = window.localStorage.getItem(`pageVisited`);

    if (!pageVisited && questions) {
      chatService.clearChat();
      chatService.setChatIsOpen(true);
      chatService.agentMessage(
        chatService.getPresetQuestions()[questions[0] as questionTitles].answer
      );
      window.localStorage.setItem(`pageVisited`, 'true');
    }
  }, [router.pathname]);

  const handleInviteCodeSubmit = async (code: string) => {
    try {
      const response = await fetch('/api/verify-invitation-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('inviteCode', code);
        setShowInviteModal(false);
      } else {
        throw new Error(data.message || 'Invalid invitation code');
      }
    } catch (error) {
      throw new Error('Invalid invitation code');
    }
  };

  const slogans = [
    // <>
    //   <Link href="/derbydashboard" className="flex items-center ">
    //     <span> Back your horse in the Berachain Derby 🏇</span>
    //   </Link>
    // </>,
    <>
      <Link
        href="https://pot2pump.honeypotfinance.xyz/launch-token?launchType=meme"
        className="flex items-center"
      >
        <span className="flex items-center justify-center gap-2">
          Launch a new meme token within 5 seconds 🚀
        </span>
      </Link>
    </>,
  ];

  return (
    <div
      className={cn(
        'flex flex-col min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#140D06]',
        className
      )}
    >
      {/* {showInviteModal && (
        <InvitationCodeModal onSubmit={handleInviteCodeSubmit} />
      )} */}

      <Script
        src="/charting_library/charting_library.standalone.js"
        strategy="beforeInteractive"
      />
      <Script
        src="/datafeeds/udf/dist/bundle.js"
        strategy="beforeInteractive"
      />

      {/* <AnnouncementBar slogans={slogans} interval={5000} /> */}
      {/* <GuideModal /> */}
      {/* <ChatWidget /> */}

      <ConfettiComponent />
      <PopOverModal />
      <Header />
      {!showInviteModal ? (
        currentchain && <div className="flex-1 flex">{children}</div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">
              {showInviteModal
                ? 'Please enter invitation code to continue'
                : 'Coming soon check back later'}
            </p>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};
