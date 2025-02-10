import { library } from "../library/library.ts";
import { Align } from "../symbol/align.ts";
import { Element } from "./element.ts";
import { Formula } from "./formula.ts";
import { Instance } from "./instance.ts";
import { Note } from "./note.ts";
import { Props } from "./props.ts";
import { Wire } from "./wire.ts";

export type Serial = (
  | [type: "i", x: number, y: number, t: number, id: string, name: string, props: Props]
  | [type: "w", x0: number, y0: number, x1: number, y1: number]
  | [type: "f", x: number, y: number, align: Align, text: string]
  | [type: "n", x: number, y: number, align: Align, text: string]
)[];

export function exportElements(elements: Iterable<Element>): Serial {
  const serial = [] as Serial;
  for (const element of elements) {
    if (element instanceof Instance) {
      const { x, y, transform, symbol, name, props } = element;
      serial.push(["i", x, y, transform, symbol.id, name, props]);
    }
    if (element instanceof Wire) {
      const { x0, y0, x1, y1 } = element;
      serial.push(["w", x0, y0, x1, y1]);
    }
    if (element instanceof Formula) {
      const { x, y, align, text } = element;
      serial.push(["f", x, y, align, text]);
    }
    if (element instanceof Note) {
      const { x, y, align, text } = element;
      serial.push(["n", x, y, align, text]);
    }
  }
  return serial;
}

export function importElements(serial: Serial): Element[] {
  const elements: Element[] = [];
  for (const item of serial) {
    switch (item[0]) {
      case "i": {
        const [_, x, y, t, id, name, props] = item;
        elements.push(new Instance(library.get(id), name, props, x, y, t));
        break;
      }
      case "w": {
        const [_, x0, y0, x1, y1] = item;
        elements.push(new Wire(x0, y0, x1, y1));
        break;
      }
      case "f": {
        const [_, x, y, align, text] = item;
        elements.push(new Formula(text, align, x, y));
        break;
      }
      case "n": {
        const [_, x, y, align, text] = item;
        elements.push(new Note(text, align, x, y));
        break;
      }
    }
  }
  return elements;
}
