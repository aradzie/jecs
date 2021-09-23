import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../simulation/props";
import type { Ammeter } from "./ammeter";

test("ammeter", (t) => {
  const circuit = readNetlist([
    ["g", ["NA"], {}],
    ["v", ["NA", "NB"], { v: 5 }],
    ["ammeter/DUT", ["NC", "NB"], {}],
    ["r", ["NA", "NC"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[NB]", 5],
      ["I[GROUND->NB]", -0.005],
      ["V[NC]", 5],
      ["I[NB->NC]", 0.005],
    ]),
  );
  const device = circuit.getDevice("DUT") as Ammeter;
  t.deepEqual(device.details(), [
    { name: "I", value: 0.005, unit: Unit.AMPERE },
  ]);
});
