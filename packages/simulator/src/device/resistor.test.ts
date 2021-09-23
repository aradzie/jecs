import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import type { Resistor } from "./resistor";

test("resistor", (t) => {
  const circuit = readNetlist([
    ["v", ["g", "NIA"], { v: 5 }],
    ["r/DUT", ["g", "NIA"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[NIA]", 5],
      ["I[GROUND->NIA]", -0.005],
    ]),
  );
  const device = circuit.getDevice("DUT") as Resistor;
  t.is(device.voltage, 5);
  t.is(device.current, 0.005);
});
