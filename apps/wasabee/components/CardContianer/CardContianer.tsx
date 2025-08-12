import { cn } from '@nextui-org/theme';

interface CardContianer {
  children: React.ReactNode;
  autoSize?: boolean;
  addtionalClassName?: string;
  childrenAutoSize?: boolean;
}

export default function CardContianer(props: CardContianer) {
  return (
    <div
      className={cn(
        'flex-1 flex w-full items-center gap-[1rem] bg-[#271A0C] pl-3 pr-4 py-3 rounded-2xl border border-[#333333] hover:border-[#F59E0B] transition-all',
        props.autoSize ? ' w-full h-full' : '',
        props.childrenAutoSize ? '*:w-full *:h-full' : '',
        props.addtionalClassName
      )}
    >
      {props.children}
    </div>
  );
}
