import { signal } from "@preact/signals";
import { DialogOptions } from "./types.ts";

let nextKey = 0;

export class Message {
  readonly #key = (nextKey += 1);

  constructor(
    readonly message: any,
    readonly options: DialogOptions,
  ) {}

  get key() {
    return this.#key;
  }
}

export const messages = signal<Message[]>([]);

export function addMessage(message: Message) {
  messages.value = [...messages.value, message];
}

export function deleteMessage(message: Message) {
  messages.value = messages.value.filter((v) => v !== message);
}
