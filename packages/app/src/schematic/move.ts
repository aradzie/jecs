import { Element } from "./element.ts";

type ElementOrigin = {
  readonly element: Element;
  readonly x: number;
  readonly y: number;
};

export class ElementListMover {
  readonly #list: ElementOrigin[];

  constructor(element: Iterable<Element>) {
    this.#list = [...element].map((element) => ({ element, x: element.x, y: element.y }));
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
