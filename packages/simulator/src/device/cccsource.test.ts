import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";

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
      ["V[GROUND]", 0],
      ["V[NIP]", 0],
      ["V[NOP]", 10],
      ["I[GROUND->NIP]", -0.01],
    ]),
  );
});
