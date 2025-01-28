import type { Symbol } from "../symbol/symbol.ts";

const wire: Symbol = {
  id: "wire",
  name: "Wire",
  category: "Conductors",
  prefix: "W",
  shapes: [
    ["l", -15, 15, 15, -15], //
  ],
  pins: [
    ["a", -15, 15],
    ["a", 15, -15],
  ],
  labels: [0, 0, "cm"],
  device: null,
};

const ground: Symbol = {
  id: "g",
  name: "Ground",
  category: "Conductors",
  prefix: "G",
  shapes: [
    ["l", 0, 0, 0, 15], //
    ["l", -20, 15, 20, 15],
    ["l", -10, 20, 10, 20],
    ["l", -5, 25, 5, 25],
  ],
  pins: [["a", 0, 0]],
  labels: [0, 30, "ct"],
  device: null,
};

const port: Symbol = {
  id: "p",
  name: "Port",
  category: "Conductors",
  prefix: "P",
  shapes: [
    ["l", 0, -15, 0, 0], //
    ["c", 0, -25, 10],
  ],
  pins: [["a", 0, 0]],
  labels: [0, -40, "cb"],
  device: null,
};

export const conductors = {
  wire,
  ground,
  port,
} as const satisfies Record<string, Symbol>;
