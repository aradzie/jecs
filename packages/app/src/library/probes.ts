import { Ammeter, Voltmeter } from "@jecs/simulator";
import type { Symbol } from "../symbol/symbol.ts";
import { arrow } from "../symbol/util.ts";

const vmeter: Symbol = {
  id: "vmeter",
  name: "Voltmeter",
  category: "Probes",
  prefix: "Pr",
  shapes: [
    ["l", 0, -30, 0, -20],
    ["c", 0, 0, 20],
    ["l", 0, 30, 0, 20],
    ["t", 0, 0, "cm", "V"],
    ...arrow(-25, 25, 25, -25),
  ],
  pins: [
    ["a", 0, -30],
    ["b", 0, 30],
  ],
  labels: [25, 0, "lm"],
  device: Voltmeter,
};

const ameter: Symbol = {
  id: "ameter",
  name: "Ammeter",
  category: "Probes",
  prefix: "Pr",
  shapes: [
    ["l", 0, -30, 0, -20],
    ["c", 0, 0, 20],
    ["l", 0, 30, 0, 20],
    ["t", 0, 0, "cm", "A"],
    ...arrow(-25, 25, 25, -25),
  ],
  pins: [
    ["a", 0, -30],
    ["b", 0, 30],
  ],
  labels: [25, 0, "lm"],
  device: Ammeter,
};

export const probes = {
  vmeter,
  ameter,
} as const satisfies Record<string, Symbol>;
