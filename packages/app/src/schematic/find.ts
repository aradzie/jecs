import { Element } from "./element.ts";
import { Formula } from "./formula.ts";
import { Instance } from "./instance.ts";
import { Wire } from "./wire.ts";

export const filter = {
  instance: 0x0001,
  formula: 0x0002,
  wire: 0x1000,
  notWire: 0x0fff,
  all: 0xffff,
} as const;

export function findElement(
  elements: Iterable<Element>,
  x: number,
  y: number,
  f: number = filter.all,
): Element | null {
  for (const element of elements) {
    if ((f & classify(element)) !== 0 && element.includes(x, y)) {
      return element;
    }
  }
  return null;
}

function classify(element: Element): number {
  switch (true) {
    case element instanceof Instance:
      return filter.instance;
    case element instanceof Formula:
      return filter.formula;
    case element instanceof Wire:
      return filter.wire;
  }
  return 0;
}
