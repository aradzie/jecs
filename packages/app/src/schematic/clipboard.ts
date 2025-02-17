import { type Element } from "./element.ts";
import { exportElements, importElements, type Serial } from "./serial.ts";

export const clipboard = new (class Clipboard {
  #serial: Serial = [];

  get full(): boolean {
    return this.#serial.length > 0;
  }

  take(): Element[] {
    return importElements(this.#serial);
  }

  put(elements: Iterable<Element>): void {
    this.#serial = exportElements(elements);
  }

  clear(): void {
    this.#serial = [];
  }
})();
