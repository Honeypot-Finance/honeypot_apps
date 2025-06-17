import { DatePickerProps, DatePicker } from "@nextui-org/react";

export function WrappedNextDatePicker(props: DatePickerProps) {
  return (
    <div className="date-picker-wrapper">
      <DatePicker
        {...props}
        classNames={{
          calendarContent: "bg-[#3B2712]",
          calendar: "date-picker-calendar",
          label: "text-red-100",
          ...props.classNames,
        }}
        calendarProps={{
          classNames: {
            base: "bg-[#271A0C] text-white",
            pickerWrapper: "bg-[#271A0C]",
            cellButton: "bg-[#271A0C] text-white",
            ...props.calendarProps?.classNames,
          },
        }}
        timeInputProps={{
          classNames: {
            base: "bg-[#3B2712] text-white",
            inputWrapper: "bg-[#3B2712]",
            ...props.timeInputProps?.classNames,
          },
        }}
      ></DatePicker>
    </div>
  );
}
