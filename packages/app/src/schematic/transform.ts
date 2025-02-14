import { Area } from "../graphics/geometry.ts";
import { Align, hAlignOf, vAlignOf } from "../symbol/align.ts";
import { TransformOp } from "../symbol/transform.ts";
import { Element } from "./element.ts";
import { Wire } from "./wire.ts";
import { Zoom } from "./zoom.ts";

export function getArea(elements: Iterable<Element>, ext: boolean): Area {
  const min = { x: +Infinity, y: +Infinity };
  const max = { x: -Infinity, y: -Infinity };
  for (const element of elements) {
    if (ext || element instanceof Wire) {
      min.x = Math.min(min.x, element.area.x0);
      min.y = Math.min(min.y, element.area.y0);
      max.x = Math.max(max.x, element.area.x1);
      max.y = Math.max(max.y, element.area.y1);
    } else {
      min.x = Math.min(min.x, element.x);
      min.y = Math.min(min.y, element.y);
      max.x = Math.max(max.x, element.x);
      max.y = Math.max(max.y, element.y);
    }
  }
  if (min.x <= max.x && min.y <= max.y) {
    return { x0: min.x, y0: min.y, x1: max.x, y1: max.y };
  } else {
    return { x0: 0, y0: 0, x1: 0, y1: 0 };
  }
}

export function alignElements(elements: Iterable<Element>, align: Align) {
  const area = getArea(elements, false);
  let dx = 0;
  let dy = 0;
  switch (hAlignOf(align)) {
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
  switch (vAlignOf(align)) {
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
  const area = getArea(elements, false);
  const cx = Zoom.snap((area.x0 + area.x1) / 2);
  const cy = Zoom.snap((area.y0 + area.y1) / 2);
  for (const element of elements) {
    element.transformBy(op, cx, cy);
  }
}
