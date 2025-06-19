import {
  SelectItemProps,
  SelectProps,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useEffect, useState } from "react";

export function WarppedNextSelect<T extends object>(props: SelectProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      {props.label && (
        <label className="text-black text-sm md:text-base font-medium">
          {props.label}{" "}
          {props.isRequired ? (
            <span className="text-red-500">*</span>
          ) : (
            <span className="text-black/50">(Optional)</span>
          )}
        </label>
      )}
      <Select
        selectionMode="single"
        className="text-black"
        classNames={{
          trigger:
            "h-[40px] md:h-[60px] text-black bg-white rounded-[12px] md:rounded-[16px] px-3 md:px-4 py-2 md:py-[18px] text-black border border-black shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)] hover:bg-white data-[hover=true]:bg-white",
          value: "!text-black text-sm md:text-base font-medium",
          innerWrapper: "text-black",
          base: "text-black",
          popoverContent: "bg-white text-black rounded-[12px] md:rounded-[16px]",
          mainWrapper: "text-black",
          selectorIcon: "text-black text-sm md:text-base",
          listbox: "text-black bg-white text-sm md:text-base",
          listboxWrapper: "text-black",
          label: "text-sm md:text-base",
          ...props.classNames,
        }}
        renderValue={(value) => {
          return (
            <div className="flex items-center gap-2">
              <span>{value[0].props?.startContent}</span>
              <span>{value[0].props?.children}</span>
            </div>
          );
        }}
        {...props}
      >
        {props.children}
      </Select>
    </div>
  );
}
// example input
// <div className="flex flex-col gap-2">
// <label className="text-black text-base font-medium">
//   Description{" "}
//   <span className="text-black/50">(Optional)</span>
// </label>
// <input
//   type="text"
//   {...register("description")}
//   className="w-full bg-white rounded-[16px] px-4 py-[18px] text-black outline-none border border-black shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)] placeholder:text-black/50 text-base font-medium"
// />
// </div>
