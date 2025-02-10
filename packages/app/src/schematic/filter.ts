import { Element } from "./element.ts";
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
