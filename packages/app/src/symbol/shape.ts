import { Align, transformAlign } from "./align.ts";
import { tMirrorX, tMirrorY, Transform, tRotate } from "./transform.ts";

/*
 * The coordinate system origin is in the top left corner,
 * so that the X coordinate increases to the right,
 * and the Y coordinate increases to the bottom.
 * Angles are measured in degrees, clockwise, starting from the X axis.
 */

export type Shape = LineShape | CircleShape | ArcShape | TextShape;

export type LineShape = readonly [type: "l", x0: number, y0: number, x1: number, y1: number];

export type CircleShape = readonly [type: "c", x: number, y: number, r: number];

export type ArcShape = readonly [
  type: "a",
  x: number,
  y: number,
  r: number,
  startAngle: number,
  endAngle: number,
];

export type TextShape = readonly [type: "t", x: number, y: number, a: Align, text: string];

export type Labels = [x: number, y: number, a: Align];

export const transformShape = (s: Shape, transform: Transform): Shape => {
  switch (s[0]) {
    case "l":
      return transformLineShape(s, transform);
    case "c":
      return transformCircleShape(s, transform);
    case "a":
      return transformArcShape(s, transform);
    case "t":
      return transformTextShape(s, transform);
  }
  return s;
};

export const transformLineShape = (s: LineShape, transform: Transform): LineShape => {
  let [type, x0, y0, x1, y1] = s;
  let tmp = 0;
  if ((transform & tRotate) !== 0) {
    tmp = x0;
    x0 = -y0;
    y0 = tmp;
    tmp = x1;
    x1 = -y1;
    y1 = tmp;
  }
  if ((transform & tMirrorX) !== 0) {
    x0 = -x0;
    x1 = -x1;
  }
  if ((transform & tMirrorY) !== 0) {
    y0 = -y0;
    y1 = -y1;
  }
  return [type, x0, y0, x1, y1];
};

export const transformCircleShape = (s: CircleShape, transform: Transform): CircleShape => {
  let [type, x, y, r] = s;
  let tmp = 0;
  if ((transform & tRotate) !== 0) {
    tmp = x;
    x = -y;
    y = tmp;
  }
  if ((transform & tMirrorX) !== 0) {
    x = -x;
  }
  if ((transform & tMirrorY) !== 0) {
    y = -y;
  }
  return [type, x, y, r];
};

export const transformArcShape = (s: ArcShape, transform: Transform): ArcShape => {
  let [type, x, y, r, startAngle, endAngle] = s;
  let tmp = 0;
  if ((transform & tRotate) !== 0) {
    tmp = x;
    x = -y;
    y = tmp;
    startAngle += 90;
    endAngle += 90;
  }
  if ((transform & tMirrorX) !== 0) {
    x = -x;
    tmp = startAngle;
    startAngle = 180 - endAngle;
    endAngle = 180 - tmp;
  }
  if ((transform & tMirrorY) !== 0) {
    y = -y;
    tmp = startAngle;
    startAngle = -endAngle;
    endAngle = -tmp;
  }
  return [type, x, y, r, startAngle, endAngle];
};

export const transformTextShape = (s: TextShape, transform: Transform): TextShape => {
  let [type, x, y, align, text] = s;
  align = transformAlign(align, transform);
  let tmp = 0;
  if ((transform & tRotate) !== 0) {
    tmp = x;
    x = -y;
    y = tmp;
  }
  if ((transform & tMirrorX) !== 0) {
    x = -x;
  }
  if ((transform & tMirrorY) !== 0) {
    y = -y;
  }
  return [type, x, y, align, text];
};

export const transformLabels = (l: Labels, transform: Transform): Labels => {
  let [x, y, align] = l;
  align = transformAlign(align, transform);
  let tmp = 0;
  if ((transform & tRotate) !== 0) {
    tmp = x;
    x = -y;
    y = tmp;
  }
  if ((transform & tMirrorX) !== 0) {
    x = -x;
  }
  if ((transform & tMirrorY) !== 0) {
    y = -y;
  }
  return [x, y, align];
};
