import { signal } from "@preact/signals";
import { Task, Tasks } from "../tasks.ts";
import { ToastOptions } from "./types.ts";

const tasks = new Tasks();

let nextKey = 0;

export class Toast {
  readonly #key = (nextKey += 1);
  #delayed: Task | null = null;

  constructor(
    readonly message: any,
    readonly options: ToastOptions,
  ) {}

  get key() {
    return this.#key;
  }

  delayed(cb: () => void, timeout: number) {
    this.clearDelayed();
    this.#delayed = tasks.delayed(timeout, cb);
  }

  clearDelayed() {
    if (this.#delayed != null) {
      this.#delayed.cancel();
      this.#delayed = null;
    }
  }
}

export const toasts = signal<readonly Toast[]>([]);

export function addToast(toast: Toast) {
  toasts.value = [...toasts.value, toast];
  scheduleAutoClose(toast);
}

export function deleteToast(toast: Toast) {
  toasts.value = toasts.value.filter((v) => v !== toast);
}

export function retainToast(toast: Toast, keep: boolean) {
  if (keep) {
    toast.clearDelayed();
  } else {
    scheduleAutoClose(toast);
  }
}

function scheduleAutoClose(toast: Toast) {
  if (toast.options.autoClose) {
    toast.delayed(() => {
      deleteToast(toast);
    }, toast.options.autoClose);
  }
}
