import Image from "next/image";

const LoadingDisplay = ({
  size = 200,
  text,
}: {
  size?: number;
  text?: string;
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative">
        <Image
          alt="loading"
          width={size}
          height={size}
          className="animate-spin"
          src="/images/loading/outline.svg"
        />
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
          <Image
            alt="loading"
            width={size / 2}
            height={size / 2}
            className="animate-breath"
            src="/images/loading/rocket.svg"
          />
        </div>
      </div>
      {text && <p className="text-[#FFCD4D] mt-[59px] font-bold">{text}</p>}
    </div>
  );
};

const LoadingContainer = ({
  size,
  text,
  children,
  isLoading,
}: {
  text?: string;
  size?: number;
  isLoading: boolean;
  children: React.ReactNode;
}) => {
  return isLoading ? <LoadingDisplay size={size} text={text} /> : children;
};

export { LoadingContainer, LoadingDisplay };
