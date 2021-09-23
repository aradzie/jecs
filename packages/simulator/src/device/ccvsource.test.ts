import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../util/unit";
import type { CCVSource } from "./ccvsource";

test("current controlled voltage source", (t) => {
  const circuit = readNetlist([
    ["g", ["NIN"], {}],
    ["g", ["NON"], {}],
    ["i", ["NIN", "NIP"], { i: 1 }],
    ["ccvs/DUT", ["NIN", "NIP", "NON", "NOP"], { gain: 2 }],
    ["r", ["NON", "NOP"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[NIP]", -0],
      ["V[NOP]", 2],
      ["I[GROUND->NIP]", 1],
      ["I[GROUND->NOP]", -0.002],
    ]),
  );
  const device = circuit.getDevice("DUT") as CCVSource;
  t.deepEqual(device.details(), [
    { name: "I", value: 0.002, unit: Unit.AMPERE },
    { name: "Vd", value: 2, unit: Unit.VOLT },
    { name: "P", value: -0.004, unit: Unit.WATT },
  ]);
});
