import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import type { VSource } from "./vsource";

test("voltage source", (t) => {
  const circuit = readNetlist([
    ["g", ["NN"], {}],
    ["v/DUT", ["NN", "NP"], { v: 5 }],
    ["r", ["NN", "NP"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[NP]", 5],
      ["I[GROUND->NP]", -0.005],
    ]),
  );
  const device = circuit.getDevice("DUT") as VSource;
  t.is(device.v, 5);
  t.is(device.current, 0.005);
  t.is(device.power, -0.025);
});