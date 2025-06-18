import { WrappedToastify } from "@/lib/wrappedToastify";
import { useEffect, useState } from "react";
import { toast, ToastOptions } from "react-toastify";

interface useToastifyArgs {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: React.ReactNode;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  options?: ToastOptions;
  txnHash?: string;
}

type contractToastState = "isLoading" | "isSuccess" | "isError" | "Idle";

export const useToastify = (transactionState: useToastifyArgs) => {
  const { isLoading, isSuccess, isError } = transactionState;
  const [isIdle, setIsIdle] = useState(true);
  const [pendingToast, setPendingToast] = useState<React.ReactText | null>(
    null
  );

  const closePendingToast = () => {
    if (pendingToast) {
      toast.dismiss(pendingToast);
      setPendingToast(null);
    }
  };

  useEffect(() => {
    if (isLoading && isIdle) {
      const pendingT = WrappedToastify.pending({
        message: transactionState.message,
        title: transactionState.title,
        icon: transactionState.icon,
        options: { autoClose: false, ...transactionState.options },
      });

      setPendingToast(pendingT);
      setIsIdle(false);
    }
    if (isSuccess && !isIdle) {
      WrappedToastify.success({
        message: transactionState.message,
        title: transactionState.title,
        icon: transactionState.icon,
        options: transactionState.options,
      });

      closePendingToast();
      setIsIdle(true);
    }
    if (isError && !isIdle) {
      WrappedToastify.error({
        message: transactionState.message,
        title: transactionState.title,
        icon: transactionState.icon,
        options: transactionState.options,
      });

      closePendingToast();
      setIsIdle(true);
    }
  }, [isLoading, isSuccess, isError]);
};
