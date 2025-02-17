import { type Element } from "./element.ts";
import { type Pin } from "./pin.ts";

export class Node {
  readonly #name: string;
  readonly #elements: readonly Element[];
  readonly #pins: readonly Pin[];

  constructor(name: string, elements: readonly Element[], pins: readonly Pin[]) {
    this.#name = name;
    this.#elements = elements;
    this.#pins = pins;
  }

  get name(): string {
    return this.#name;
  }

  get elements(): readonly Element[] {
    return this.#elements;
  }

  get pins(): readonly Pin[] {
    return this.#pins;
  }
}
