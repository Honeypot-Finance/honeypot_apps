import { observer } from 'mobx-react-lite';
import { Header } from './header/v3';
import { useRouter } from 'next/router';
import AnnouncementBar from './AnnouncementBar';
import Link from 'next/link';
import { Footer } from './footer';
import { cn } from '@/lib/algebra/lib/utils';

export const Layout = observer(
  ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    const router = useRouter();

    const slogans = [
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
          "flex flex-col min-h-screen w-full overflow-x-hidden overflow-y-auto bg-black bg-[url('/images/icons/bg-honey.png')]",
          className
        )}
      >
        <AnnouncementBar slogans={slogans} interval={5000} />
        <Header />
        <div className="flex-1 flex">{children}</div>
        <Footer />
      </div>
    );
  }
);
