import { tMirrorX, tMirrorY, Transform, TransformOp, tRotate } from "./transform.ts";

export type Align = `${HorizontalAlign}${VerticalAlign}`;
export type HorizontalAlign = "l" | "c" | "r";
export type VerticalAlign = "t" | "m" | "b";

export const hAlignOf = (align: Align): HorizontalAlign => {
  return align.charAt(0) as HorizontalAlign;
};

export const vAlignOf = (align: Align): VerticalAlign => {
  return align.charAt(1) as VerticalAlign;
};

export const transformAlignBy = (align: Align, op: TransformOp): Align => {
  let h = hAlignOf(align);
  let v = vAlignOf(align);
  switch (op) {
    case "mx":
      switch (h) {
        case "l":
          h = "r";
          break;
        case "r":
          h = "l";
          break;
      }
      break;
    case "my":
      switch (v) {
        case "t":
          v = "b";
          break;
        case "b":
          v = "t";
          break;
      }
      break;
  }
  return `${h}${v}`;
};

export const transformAlign = (align: Align, transform: Transform): Align => {
  if ((transform & tRotate) !== 0) {
    switch (align) {
      case "lt":
        align = "rt";
        break;
      case "lm":
        align = "ct";
        break;
      case "lb":
        align = "lt";
        break;
      case "ct":
        align = "rm";
        break;
      case "cb":
        align = "lm";
        break;
      case "rt":
        align = "rb";
        break;
      case "rm":
        align = "cb";
        break;
      case "rb":
        align = "lb";
        break;
    }
  }
  let h = hAlignOf(align);
  let v = vAlignOf(align);
  if ((transform & tMirrorX) !== 0) {
    switch (h) {
      case "l":
        h = "r";
        break;
      case "r":
        h = "l";
        break;
    }
  }
  if ((transform & tMirrorY) !== 0) {
    switch (v) {
      case "t":
        v = "b";
        break;
      case "b":
        v = "t";
        break;
    }
  }
  return `${h}${v}`;
};
