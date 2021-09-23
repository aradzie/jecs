import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";

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
});
