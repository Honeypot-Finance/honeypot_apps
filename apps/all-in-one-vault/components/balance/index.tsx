import clsx from "clsx";
import { observer } from "mobx-react-lite";
import { useAccount, useBalance } from "wagmi";

export const Balance = observer(({children, className}: {children: React.ReactNode; className?:string}) => {
  return (
    <div className={clsx("flex h-[43px] text-black  justify-center items-center gap-[5.748px] bg-[#FFCD4D] shadow-[-0.359px_-1.796px_0px_0px_#946D3F_inset] px-[14.369px] py-[7.184px] rounded-[21.553px] border-[0.718px] border-solid border-[rgba(148,109,63,0.37)]", className)}>{children}</div>
  );
});
