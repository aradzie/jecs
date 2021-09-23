import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";

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
      ["V[NIP]", 0],
      ["V[NOP]", 2],
      ["I[GROUND->NIP]", 1],
      ["I[GROUND->NOP]", 0.002],
    ]),
  );
});
