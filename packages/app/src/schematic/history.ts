import { Schematic } from "./schematic.ts";
import { exportElements, importElements, type Serial } from "./serial.ts";
import { makeUnusable } from "./unusable.ts";

export class History {
  static create(initial: Schematic): History {
    const history = new History();
    history.#state = new State(initial);
    return history;
  }

  #state: State = unusable;

  private constructor() {}

  push(schematic: Schematic, action: string): History {
    this.#state.push(schematic, action);
    return this.#transfer();
  }

  get canUndo(): boolean {
    return this.#state.canUndo;
  }

  undo(): [Schematic, History] {
    return [this.#state.undo(), this.#transfer()];
  }

  get canRedo(): boolean {
    return this.#state.canRedo;
  }

  redo(): [Schematic, History] {
    return [this.#state.redo(), this.#transfer()];
  }

  #transfer() {
    const that = new History();
    that.#state = this.#state;
    this.#state = unusable;
    return that;
  }
}

class State {
  readonly #stack: [serial: Serial, action: string][];
  #index: number;

  constructor(initial: Schematic) {
    this.#stack = [[exportElements(initial), "initial"]];
    this.#index = 0;
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

const unusable = makeUnusable<State>();
