import Link from "next/link";
import Image from "next/image";
import { footerData } from "@/config/allAppPath";
import { ReactNode } from "react";
import { useRouter } from "next/router";

export const Footer = () => {
  return (
    <footer className="w-full min-h-[50px]">
      <CurrentPageFooter />
    </footer>
  );
};

export const CurrentPageFooter = () => {
  const paths = useRouter().pathname.split("/");
  const footer: ReactNode = footerData[paths[1]];

  return footer ?? <div className="bg-[url('/images/footer.png')] min-h-[120px] md:min-h-[160px] bg-cover bg-no-repeat bg-center relative mt-20 md:mt-40">
    <Image 
      src="/images/footer-sticky.png" 
      alt="" 
      width={385} 
      height={394} 
      className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[250px] md:w-[385px] h-auto"
    />
  </div>;
};
