import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import type { Ammeter } from "./ammeter";

test("ammeter", (t) => {
  const circuit = readNetlist([
    ["v", ["g", "NIA"], { v: 5 }],
    ["ammeter/DUT", ["NIA", "NIB"], {}],
    ["r", ["g", "NIB"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[NIA]", 5],
      ["I[GROUND->NIA]", -0.005],
      ["V[NIB]", 5],
      ["I[NIA->NIB]", 0.005],
    ]),
  );
  const device = circuit.getDevice("DUT") as Ammeter;
  t.is(device.current, 0.005);
});
