import { Element } from "./element.ts";
import { Formula } from "./formula.ts";
import { Instance } from "./instance.ts";
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

export function filterFormulas(elements: Iterable<Element>): Formula[] {
  const list = [] as Formula[];
  for (const element of elements) {
    if (element instanceof Formula) {
      list.push(element);
    }
  }
  return list;
}
