import { cloneElement, createContext } from "preact";
import { useContext } from "preact/hooks";
import { deleteToast, retainToast, type Toast } from "./state.ts";

export type ToastContextValue = {
  readonly close: () => void;
  readonly hover: (over: boolean) => void;
  readonly click: () => void;
};

export const ToastContext = createContext<ToastContextValue>(null!);

export function ToastProvider({ toast, children }: { toast: Toast; children: any }) {
  return (
    <ToastContext.Provider
      value={{
        close: () => {
          deleteToast(toast);
        },
        hover: (over) => {
          if (toast.options.autoClose && toast.options.pauseOnHover) {
            retainToast(toast, over);
          }
        },
        click: () => {
          if (toast.options.closeOnClick) {
            deleteToast(toast);
          }
        },
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

export function toastProps(toast: ToastContextValue) {
  return {
    onMouseEnter: () => {
      toast.hover(true);
    },
    onMouseLeave: () => {
      toast.hover(false);
    },
    onClick: () => {
      toast.click();
    },
  };
}

export function ToastWrapper({ children }: { children: any }) {
  return cloneElement(children, {
    ...children.props,
    ...toastProps(useToast()),
  });
}
