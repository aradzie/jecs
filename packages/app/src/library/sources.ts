import { Idc, Vdc } from "@jecs/simulator/lib/device/index.js";
import type { Symbol } from "../symbol/symbol.ts";

const vdc: Symbol = {
  id: "vdc",
  name: "Ideal DC voltage source",
  category: "Sources",
  prefix: "V",
  shapes: [
    ["l", 0, -30, 0, -20], // top leg
    ["c", 0, 0, 20], // body
    ["l", 0, -15, 0, -5],
    ["l", -5, -10, 5, -10],
    ["l", -5, 10, 5, 10],
    ["l", 0, 30, 0, 20], // bottom leg
  ],
  pins: [
    ["pos", 0, -30],
    ["neg", 0, 30],
  ],
  labels: [25, 0, "lm"],
  device: Vdc,
};

const idc: Symbol = {
  id: "idc",
  name: "Ideal DC current source",
  category: "Sources",
  prefix: "I",
  shapes: [
    ["l", 0, -30, 0, -20], // top leg
    ["c", 0, 0, 20], // body
    ["l", 0, 10, 0, -10], // arrow h
    ["l", 0, -11, -5, -3], // arrow l
    ["l", 0, -11, 5, -3], // arrow r
    ["l", 0, 30, 0, 20], // bottom leg
  ],
  pins: [
    ["pos", 0, -30],
    ["neg", 0, 30],
  ],
  labels: [25, 0, "lm"],
  device: Idc,
};

export const sources = {
  vdc,
  idc,
} as const satisfies Record<string, Symbol>;
