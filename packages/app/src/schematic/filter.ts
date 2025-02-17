import { type Element } from "./element.ts";
import { Instance } from "./instance.ts";
import { Note } from "./note.ts";
import { Wire } from "./wire.ts";

export function filterInstances(elements: Iterable<Element>): Instance[] {
  const list = [] as Instance[];
  for (const element of elements) {
    if (element instanceof Instance) {
      list.push(element);
    }
  }
  return list;
}

export function filterWires(elements: Iterable<Element>): Wire[] {
  const list = [] as Wire[];
  for (const element of elements) {
    if (element instanceof Wire) {
      list.push(element);
    }
  }
  return list;
}

export function filterNotes(elements: Iterable<Element>): Note[] {
  const list = [] as Note[];
  for (const element of elements) {
    if (element instanceof Note) {
      list.push(element);
    }
  }
  return list;
}

export const filter = {
  instance: 0x0001,
  note: 0x0002,
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
    case element instanceof Note:
      return filter.note;
    case element instanceof Wire:
      return filter.wire;
  }
  return 0;
}
