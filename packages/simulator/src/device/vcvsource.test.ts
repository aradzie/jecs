import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";

test("voltage controlled voltage source", (t) => {
  const circuit = readNetlist([
    ["v", ["g", "NIB"], { v: 3 }],
    ["vcvs", ["g", "NIB", "g", "NOB"], { gain: 0.5 }],
    ["r", ["g", "NOB"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[NIB]", 3],
      ["I[GROUND->NIB]", 0],
      ["V[NOB]", 1.5],
      ["I[GROUND->NOB]", -0.0015],
    ]),
  );
});
