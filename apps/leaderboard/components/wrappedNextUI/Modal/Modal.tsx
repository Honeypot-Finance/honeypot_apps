import { cn } from '@nextui-org/theme';
import {
  Modal,
  ModalBody,
  ModalBodyProps,
  ModalContent,
  ModalContentProps,
  ModalProps,
} from '@nextui-org/react';

export function WrappedNextModal(
  props: ModalProps & { boarderLess?: boolean }
) {
  return (
    <Modal
      {...props}
      classNames={{
        base: cn(
          'bg-[#271A0C] border-[#F0E7D8] border-2 overflow-visible ',
          props.boarderLess && 'border-none !bg-transparent p-0 shadow-none'
        ),
        wrapper: cn(
          props.boarderLess &&
            'border-none !bg-transparent p-0 overflow-visible shadow-none w-auto'
        ),
        body: cn(
          props.boarderLess &&
            'border-none !bg-transparent p-0 overflow-visible shadow-none w-auto'
        ),

        ...props.classNames,
      }}
    ></Modal>
  );
}

export function WrappedNextModalContent(
  props: ModalContentProps & { boarderLess?: boolean }
) {
  return (
    <ModalContent
      {...props}
      className={cn(
        props.className,
        props.boarderLess && 'border-none bg-transparent overflow-visible'
      )}
    ></ModalContent>
  );
}

export function WrappedNextModalBody(
  props: ModalBodyProps & { boarderLess?: boolean }
) {
  return (
    <ModalBody
      {...props}
      className={cn(
        props.className,
        props.boarderLess && 'border-none bg-transparent overflow-visible'
      )}
    ></ModalBody>
  );
}
