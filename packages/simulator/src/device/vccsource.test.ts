import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../simulation/props";
import type { VCCSource } from "./vccsource";

test("voltage controlled current source", (t) => {
  const circuit = readNetlist([
    ["g", ["NIN"], {}],
    ["g", ["NON"], {}],
    ["v", ["NIN", "NIP"], { v: 1 }],
    ["vccs/DUT", ["NIN", "NIP", "NON", "NOP"], { gain: 0.5 }],
    ["r", ["NIN", "NOP"], { r: 10 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[NIP]", 1],
      ["I[GROUND->NIP]", 0],
      ["V[NOP]", 5],
      ["I[GROUND->NOP]", 0.5],
    ]),
  );
  const device = circuit.getDevice("DUT") as VCCSource;
  t.deepEqual(device.details(), [
    { name: "I", value: 0.5, unit: Unit.AMPERE },
    { name: "Vd", value: 5, unit: Unit.VOLT },
  ]);
});
