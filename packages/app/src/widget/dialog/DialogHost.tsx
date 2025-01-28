import { Dialog } from "./Dialog.tsx";
import * as styles from "./DialogHost.module.css";
import { addMessage, Message, messages } from "./state.ts";
import { DialogOptions } from "./types.ts";

export function DialogHost() {
  return (
    <div class={styles.root} hidden={messages.value.length === 0}>
      {messages.value.map((message) => (
        <Dialog message={message} />
      ))}
    </div>
  );
}

export function showDialog(
  message: any,
  {
    modal = true, //
    onClose = () => {},
  }: Partial<DialogOptions> = {},
) {
  addMessage(new Message(message, { modal, onClose }));
}
