import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../simulation/props";
import type { VCVSource } from "./vcvsource";

test("voltage controlled voltage source", (t) => {
  const circuit = readNetlist([
    ["g", ["NIN"], {}],
    ["g", ["NON"], {}],
    ["v", ["NIN", "NIP"], { v: 5 }],
    ["vcvs/DUT", ["NIN", "NIP", "NON", "NOP"], { gain: 2 }],
    ["r", ["NON", "NOP"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[NIP]", 5],
      ["I[GROUND->NIP]", 0],
      ["V[NOP]", 10],
      ["I[GROUND->NOP]", -0.01],
    ]),
  );
  const device = circuit.getDevice("DUT") as VCVSource;
  t.deepEqual(device.details(), [
    { name: "I", value: 0.01, unit: Unit.AMPERE },
    { name: "Vd", value: 10, unit: Unit.VOLT },
    { name: "P", value: -0.1, unit: Unit.WATT },
  ]);
});
