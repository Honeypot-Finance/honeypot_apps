interface CustomToastifyContainerProps {
  title: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export default function CustomToastifyContainer(
  props: CustomToastifyContainerProps
) {
  return (
    <div className="w-full h-full grid grid-rows-[22px_1fr]  overflow-hidden">
      <div className=" bg-[#FCD729] text-black px-2 flex  items-center">
        <h1>{props.title}</h1>
      </div>
      <div className="grid grid-cols-[50px_1fr]">
        <div className="p-2 flex justify-center items-center">{props.icon}</div>
        <div className="p-2 ">{props.children}</div>
      </div>
    </div>
  );
}
