import { Schematic } from "./schematic.ts";
import { exportElements, importElements, Serial } from "./serial.ts";

export class History implements Iterable<[index: number, action: string]> {
  readonly #stack: [serial: Serial, action: string][];
  #index: number;

  constructor(initial: Schematic) {
    this.#stack = [[exportElements(initial), "initial"]];
    this.#index = 0;
  }

  *[Symbol.iterator](): IterableIterator<[index: number, action: string]> {
    let index = 0;
    for (const [serial, action] of this.#stack) {
      yield [index, action];
      index += 1;
    }
  }

  get length(): number {
    return this.#stack.length;
  }

  push(schematic: Schematic, action: string) {
    this.#index += 1;
    this.#stack.splice(this.#index);
    this.#stack.push([exportElements(schematic), action]);
  }

  get canUndo(): boolean {
    return this.#index > 0;
  }

  undo(): Schematic {
    if (this.canUndo) {
      this.#index -= 1;
    }
    const [serial] = this.#stack[this.#index];
    return new Schematic(importElements(serial));
  }

  get canRedo(): boolean {
    return this.#index < this.#stack.length - 1;
  }

  redo(): Schematic {
    if (this.canRedo) {
      this.#index += 1;
    }
    const [serial] = this.#stack[this.#index];
    return new Schematic(importElements(serial));
  }
}
