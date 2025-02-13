import { tMirrorX, tMirrorY, Transform, tRotate } from "./transform.ts";

export type Align = `${HorizontalAlign}${VerticalAlign}`;
export type HorizontalAlign = "l" | "c" | "r";
export type VerticalAlign = "t" | "m" | "b";

export const hAlignOf = (align: Align): HorizontalAlign => {
  return align.charAt(0) as HorizontalAlign;
};

export const vAlignOf = (align: Align): VerticalAlign => {
  return align.charAt(1) as VerticalAlign;
};

export const transformAlign = (align: Align, transform: Transform): Align => {
  let h = hAlignOf(align);
  let v = vAlignOf(align);
  if ((transform & tRotate) !== 0) {
    switch (align) {
      case "lt":
        break;
      case "lm":
        break;
      case "lb":
        break;
      case "ct":
        break;
      case "cm":
        break;
      case "cb":
        break;
      case "rt":
        break;
      case "rm":
        break;
      case "rb":
        break;
    }
  }
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
