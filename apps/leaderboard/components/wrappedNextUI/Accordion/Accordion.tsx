import { Accordion, AccordionProps } from "@nextui-org/react";

export function WrappedNextAccordion(props: AccordionProps) {
  return <Accordion>{props.children}</Accordion>;
}
