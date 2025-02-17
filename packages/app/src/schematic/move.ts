import { type Element } from "./element.ts";

export class ElementListMover {
  readonly #elements: Element[];
  readonly #list: Item[];

  constructor(elements: Iterable<Element>) {
    this.#elements = [...elements];
    this.#list = [...elements].map((element) => ({ element, x: element.x, y: element.y }));
  }

  get elements(): Iterable<Element> {
    return this.#elements;
  }

  moveBy(dx: number, dy: number): void {
    for (const { element, x, y } of this.#list) {
      element.moveTo(x + dx, y + dy);
    }
  }

  reset(): void {
    for (const { element, x, y } of this.#list) {
      element.moveTo(x, y);
    }
  }
}

type Item = {
  readonly element: Element;
  readonly x: number;
  readonly y: number;
};
