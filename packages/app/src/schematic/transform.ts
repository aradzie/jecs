import { Area } from "../graphics/geometry.ts";
import { Align, HorizontalAlign, VerticalAlign } from "../symbol/align.ts";
import { TransformOp } from "../symbol/transform.ts";
import { Element } from "./element.ts";
import { Formula } from "./formula.ts";
import { Instance } from "./instance.ts";
import { Note } from "./note.ts";
import { Wire } from "./wire.ts";
import { Zoom } from "./zoom.ts";

export function getArea(elements: Iterable<Element>): Area {
  const min = { x: +Infinity, y: +Infinity };
  const max = { x: -Infinity, y: -Infinity };
  for (const { area } of elements) {
    min.x = Math.min(min.x, area.x0);
    min.y = Math.min(min.y, area.y0);
    max.x = Math.max(max.x, area.x1);
    max.y = Math.max(max.y, area.y1);
  }
  if (min.x < max.x && min.y < max.y) {
    return { x0: min.x, y0: min.y, x1: max.x, y1: max.y };
  } else {
    return { x0: 0, y0: 0, x1: 0, y1: 0 };
  }
}

export function alignElements(elements: Iterable<Element>, align: Align) {
  const h = align.charAt(0) as HorizontalAlign;
  const v = align.charAt(1) as VerticalAlign;
  const area = getArea(elements);
  let dx = 0;
  let dy = 0;
  switch (h) {
    case "l":
      dx = area.x0;
      break;
    case "c":
      dx = Zoom.snap((area.x0 + area.x1) / 2);
      break;
    case "r":
      dx = area.x1;
      break;
  }
  switch (v) {
    case "t":
      dy = area.y0;
      break;
    case "m":
      dy = Zoom.snap((area.y0 + area.y1) / 2);
      break;
    case "b":
      dy = area.y1;
      break;
  }
  for (const element of elements) {
    element.moveTo(element.x - dx, element.y - dy);
  }
}

export function transformElements(elements: Iterable<Element>, op: TransformOp) {
  const area = getArea(elements);
  const cx = Zoom.snap((area.x0 + area.x1) / 2);
  const cy = Zoom.snap((area.y0 + area.y1) / 2);
  for (const element of elements) {
    if (element instanceof Wire) {
      transformWire(element, op, cy, cx);
    } else {
      transformElement(element, op, cy, cx);
    }
  }
}

function transformWire(wire: Wire, op: TransformOp, cy: number, cx: number) {
  const { x0, y0, x1, y1 } = wire;
  switch (op) {
    case "rl":
      wire.x0 = cx + (y0 - cy);
      wire.y0 = cy - (x0 - cx);
      wire.x1 = cx + (y1 - cy);
      wire.y1 = cy - (x1 - cx);
      break;
    case "rr":
      wire.x0 = cx - (y0 - cy);
      wire.y0 = cy + (x0 - cx);
      wire.x1 = cx - (y1 - cy);
      wire.y1 = cy + (x1 - cx);
      break;
    case "mx":
      wire.x0 = 2 * cx - x0;
      wire.x1 = 2 * cx - x1;
      break;
    case "my":
      wire.y0 = 2 * cy - y0;
      wire.y1 = 2 * cy - y1;
      break;
  }
}

function transformElement(element: Element, op: TransformOp, cy: number, cx: number) {
  const { x, y } = element;
  switch (op) {
    case "rl":
      element.moveTo(cx + (y - cy), cy - (x - cx));
      break;
    case "rr":
      element.moveTo(cx - (y - cy), cy + (x - cx));
      break;
    case "mx":
      element.moveTo(2 * cx - x, y);
      break;
    case "my":
      element.moveTo(x, 2 * cy - y);
      break;
  }
  switch (true) {
    case element instanceof Instance:
      element.transformBy(op);
      break;
    case element instanceof Formula:
      // TODO Transform alignment.
      break;
    case element instanceof Note:
      // TODO Transform alignment.
      break;
  }
}
