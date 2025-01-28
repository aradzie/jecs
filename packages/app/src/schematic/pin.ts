import { Instance } from "./instance.ts";

export class Pin {
  readonly #x: number;
  readonly #y: number;
  readonly #instance: Instance;
  readonly #name: string;

  constructor(x: number, y: number, instance: Instance, name: string) {
    this.#x = x;
    this.#y = y;
    this.#instance = instance;
    this.#name = name;
  }

  get x(): number {
    return this.#x;
  }

  get y(): number {
    return this.#y;
  }

  get instance(): Instance {
    return this.#instance;
  }

  get name(): string {
    return this.#name;
  }
}
