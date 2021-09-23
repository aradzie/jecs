import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";

test("voltage controlled voltage source", (t) => {
  const circuit = readNetlist([
    ["g", ["NIN"], {}],
    ["g", ["NON"], {}],
    ["v", ["NIN", "NIP"], { v: 5 }],
    ["vcvs/DUT", ["NIN", "NIP", "NON", "NOP"], { gain: 0.5 }],
    ["r", ["NON", "NOP"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[NIP]", 5],
      ["I[GROUND->NIP]", 0],
      ["V[NOP]", 2.5],
      ["I[GROUND->NOP]", -0.0025],
    ]),
  );
});
