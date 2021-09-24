import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../util/unit";
import type { CCCSource } from "./cccsource";

test("current controlled current source", (t) => {
  const circuit = readNetlist([
    ["g", ["NIN"], {}],
    ["g", ["NON"], {}],
    ["i", ["NIN", "NIP"], { i: 0.001 }],
    ["cccs/DUT", ["NIN", "NIP", "NON", "NOP"], { gain: 10 }],
    ["r", ["NON", "NOP"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[NIP]", 0],
      ["V[NOP]", 10],
      ["I[GROUND->NIP]", -0.01],
    ]),
  );
  const device = circuit.getDevice("DUT") as CCCSource;
  t.deepEqual(device.details(), [
    { name: "I", value: -0.01, unit: Unit.AMPERE },
    { name: "Vd", value: 10, unit: Unit.VOLT },
  ]);
});
