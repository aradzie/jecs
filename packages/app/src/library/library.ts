import type { Symbol } from "../symbol/symbol.ts";
import { conductors } from "./conductors.ts";
import { linear } from "./linear.ts";
import { nonlinear } from "./nonlinear.ts";
import { probes } from "./probes.ts";
import { sources } from "./sources.ts";

export class Library implements Iterable<Symbol> {
  readonly #map = new Map<string, Symbol>();

  constructor(symbols: Iterable<Symbol>) {
    for (const symbol of symbols) {
      this.#map.set(symbol.id, symbol);
    }
  }

  [Symbol.iterator](): IterableIterator<Symbol> {
    return this.#map.values();
  }

  get(id: string): Symbol {
    const symbol = this.#map.get(id);
    if (symbol == null) {
      throw new Error(`Unknown symbol [${id}]`);
    }
    return symbol;
  }
}

export const library = new Library([
  ...Object.values(conductors),
  ...Object.values(linear),
  ...Object.values(nonlinear),
  ...Object.values(sources),
  ...Object.values(probes),
]);
