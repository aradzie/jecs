import { Element } from "./element.ts";
import { Id } from "./unique.ts";

export type ReadonlySelection = {
  has(element: Element): boolean;
  filter(elements: Iterable<Element>): Element[];
};

export class Selection implements ReadonlySelection, Iterable<Id> {
  readonly #items: Set<Id>;

  constructor(elements: Iterable<Element> = []) {
    this.#items = new Set();
    for (const { id } of elements) {
      this.#items.add(id);
    }
  }

  [Symbol.iterator](): IterableIterator<Id> {
    return this.#items[Symbol.iterator]();
  }

  get size(): number {
    return this.#items.size;
  }

  get full(): boolean {
    return this.#items.size > 0;
  }

  has({ id }: Element): boolean {
    return this.#items.has(id);
  }

  filter(elements: Iterable<Element>): Element[] {
    return [...elements].filter(({ id }) => this.#items.has(id));
  }

  select(elements: Iterable<Element>): Selection {
    return new Selection(elements);
  }

  add(elements: Iterable<Element>): Selection {
    const copy = new Selection();
    for (const id of this.#items) {
      copy.#items.add(id);
    }
    for (const { id } of elements) {
      copy.#items.add(id);
    }
    return copy;
  }

  delete(elements: Iterable<Element>): Selection {
    const copy = new Selection();
    for (const id of this.#items) {
      copy.#items.add(id);
    }
    for (const { id } of elements) {
      copy.#items.delete(id);
    }
    return copy;
  }

  clear() {
    return new Selection();
  }
}
