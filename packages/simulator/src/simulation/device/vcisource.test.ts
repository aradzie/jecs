import test from "ava";
import { readNetlist } from "../netlist";

test("voltage controlled current source", (t) => {
  const circuit = readNetlist([
    ["v", ["g", "NIB"], { v: 3 }],
    ["vcis", ["g", "NIB", "g", "NOB"], { gain: 0.5 }],
    ["r", ["g", "NOB"], { r: 100 }],
  ]);
  const r = circuit.dc();
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[NIB]", 3],
      ["I[GROUND->NIB]", 0],
      ["V[NOB]", 150],
    ]),
  );
});
