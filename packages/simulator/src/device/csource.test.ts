import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import type { CSource } from "./csource";

test("current source", (t) => {
  const circuit = readNetlist([
    ["g", ["NN"], {}],
    ["i/DUT", ["NN", "NP"], { i: 0.005 }],
    ["r", ["NN", "NP"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[NP]", 5],
    ]),
  );
  const device = circuit.getDevice("DUT") as CSource;
  t.is(device.voltage, 5);
});