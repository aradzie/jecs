import { useEffect, useRef } from "preact/hooks";
import { DialogContext } from "./context.tsx";
import * as styles from "./Dialog.module.css";
import { deleteMessage, type Message } from "./state.ts";

export function Dialog({ message }: { message: Message }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (message.options.modal) {
      ref.current?.showModal();
    } else {
      ref.current?.show();
    }
  }, [message]);
  return (
    <dialog
      key={message.key}
      ref={ref}
      class={styles.root}
      onClose={() => {
        deleteMessage(message);
        message.options.onClose();
      }}
    >
      <DialogContext
        value={{
          close: () => {
            ref.current?.close();
          },
        }}
      >
        {message.message}
      </DialogContext>
    </dialog>
  );
}
