import { tMirrorX, tMirrorY, type Transform, tRotate } from "./transform.ts";

export type Pin = readonly [name: string, x: number, y: number];

export const transformPin = (pin: Pin, transform: Transform): Pin => {
  let [name, x, y] = pin;
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
  return [name, x, y];
};
