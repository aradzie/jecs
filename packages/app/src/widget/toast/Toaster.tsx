import { ToastProvider, ToastWrapper } from "./context.tsx";
import { addToast, Toast, toasts } from "./state.ts";
import * as styles from "./Toaster.module.css";
import { ToastOptions } from "./types.ts";

export function Toaster() {
  return (
    <div class={styles.root} hidden={toasts.value.length === 0}>
      {[...toasts.value].reverse().map((toast) => (
        <ToastProvider key={toast.key} toast={toast}>
          <ToastWrapper>{toast.message}</ToastWrapper>
        </ToastProvider>
      ))}
    </div>
  );
}

export function toast(
  message: any,
  {
    autoClose = 3000, //
    pauseOnHover = true,
    closeOnClick = true,
  }: Partial<ToastOptions> = {},
) {
  addToast(
    new Toast(message, {
      autoClose,
      pauseOnHover,
      closeOnClick,
    }),
  );
}
