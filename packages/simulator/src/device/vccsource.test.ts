import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../util/unit";
import type { VCCSource } from "./vccsource";

test("voltage controlled current source", (t) => {
  const circuit = readNetlist([
    ["g", ["NCN"], {}],
    ["g", ["NON"], {}],
    ["v", ["NCP", "NCN"], { v: 1 }],
    ["vccs/DUT", ["NOP", "NON", "NCP", "NCN"], { gain: 0.5 }],
    ["r", ["NOP", "NON"], { r: 10 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[NCP]", 1],
      ["I[NCP->GROUND]", 0],
      ["V[NOP]", -5],
      ["I[NOP->GROUND]", 0.5],
    ]),
  );
  const device = circuit.getDevice("DUT") as VCCSource;
  t.deepEqual(device.details(), [
    { name: "Vd", value: -5, unit: Unit.VOLT },
    { name: "I", value: 0.5, unit: Unit.AMPERE },
  ]);
});
