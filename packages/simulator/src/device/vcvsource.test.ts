import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../util/unit";
import type { VCVSource } from "./vcvsource";

test("voltage controlled voltage source", (t) => {
  const circuit = readNetlist([
    ["g", ["NCN"], {}],
    ["g", ["NON"], {}],
    ["v", ["NCP", "NCN"], { v: 5 }],
    ["vcvs/DUT", ["NOP", "NON", "NCP", "NCN"], { gain: 2 }],
    ["r", ["NOP", "NON"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[NCP]", 5],
      ["I[NCP->GROUND]", 0],
      ["V[NOP]", 10],
      ["I[NOP->GROUND]", -0.01],
    ]),
  );
  const device = circuit.getDevice("DUT") as VCVSource;
  t.deepEqual(device.details(), [
    { name: "Vd", value: 10, unit: Unit.VOLT },
    { name: "I", value: -0.01, unit: Unit.AMPERE },
    { name: "P", value: -0.1, unit: Unit.WATT },
  ]);
});
