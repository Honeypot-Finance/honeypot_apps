import {
  Dropdown,
  DropdownMenu,
  DropdownMenuProps,
  DropdownProps,
} from "@nextui-org/react";

export function WarppedNextDropdownMenu(props: DropdownMenuProps) {
  return <DropdownMenu classNames={{}} {...props} />;
}

export function WarppedNextDropdown(props: DropdownProps) {
  return (
    <Dropdown
      classNames={{
        content: "bg-[#271A0C]",
      }}
      {...props}
    />
  );
}
