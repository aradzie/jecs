import { Capacitor, Inductor, Resistor } from "@jecs/simulator";
import { type Symbol } from "../symbol/symbol.ts";

const resistor: Symbol = {
  id: "r",
  name: "Resistor",
  category: "Linear",
  prefix: "R",
  shapes: [
    ["l", 0, -30, 0, -20], // top leg
    ["l", -8, -20, 8, -20], // top
    ["l", -8, 20, 8, 20], // bottom
    ["l", -8, -20, -8, 20], // left
    ["l", 8, -20, 8, 20], // right
    ["l", 0, 30, 0, 20], // bottom leg
  ],
  pins: [
    ["a", 0, -30],
    ["b", 0, 30],
  ],
  labels: [15, 0, "lm"],
  device: Resistor,
};

const capacitor: Symbol = {
  id: "c",
  name: "Capacitor",
  category: "Linear",
  prefix: "C",
  shapes: [
    ["l", 0, -30, 0, -6], // top leg
    ["l", -20, -6, 20, -6], // top plate
    ["l", -20, 6, 20, 6], // bottom plate
    ["l", 0, 30, 0, 6], // bottom leg
  ],
  pins: [
    ["a", 0, -30],
    ["b", 0, 30],
  ],
  labels: [30, 0, "lm"],
  device: Capacitor,
};

const inductor: Symbol = {
  id: "l",
  name: "Inductor",
  category: "Linear",
  prefix: "L",
  shapes: [
    ["l", 0, -30, 0, -22], // top leg
    ["a", 0, -14, 7, -90, 90], // top arc
    ["a", 0, 0, 7, -90, 90], // middle arc
    ["a", 0, 14, 7, -90, 90], // bottom arc
    ["l", 0, 30, 0, 22], // bottom leg
  ],
  pins: [
    ["a", 0, -30],
    ["b", 0, 30],
  ],
  labels: [15, 0, "lm"],
  device: Inductor,
};

export const linear = {
  resistor,
  capacitor,
  inductor,
} as const satisfies Record<string, Symbol>;
