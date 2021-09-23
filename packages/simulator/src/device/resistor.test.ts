import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../simulation/props";
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
  t.deepEqual(device.details(), [
    { name: "I", value: 0.005, unit: Unit.AMPERE },
    { name: "Vd", value: 5, unit: Unit.VOLT },
    { name: "P", value: 0.025, unit: Unit.WATT },
  ]);
});
