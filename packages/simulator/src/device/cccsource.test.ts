import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../util/unit";
import type { CCCSource } from "./cccsource";

test("current controlled current source", (t) => {
  const circuit = readNetlist([
    ["g", ["NCN"], {}],
    ["g", ["NON"], {}],
    ["i", ["NCP", "NCN"], { i: -1 }],
    ["cccs/DUT", ["NOP", "NON", "NCP", "NCN"], { gain: 2 }],
    ["r", ["NOP", "NON"], { r: 5 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[NCP]", 0],
      ["V[NOP]", 10],
      ["I[NCP->GROUND]", -2],
    ]),
  );
  const device = circuit.getDevice("DUT") as CCCSource;
  t.deepEqual(device.details(), [
    { name: "Vd", value: 10, unit: Unit.VOLT },
    { name: "I", value: -2, unit: Unit.AMPERE },
  ]);
});
