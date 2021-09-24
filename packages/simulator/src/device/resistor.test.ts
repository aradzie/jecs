import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../util/unit";

test("resistor", (t) => {
  const circuit = readNetlist([
    ["v", ["NP", "g"], { v: 5 }],
    ["r/DUT", ["NP", "g"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[NP]", 5],
      ["I[NP->GROUND]", -0.005],
    ]),
  );
  const dut = circuit.getDevice("DUT");
  t.deepEqual(dut.details(), [
    { name: "Vd", value: 5, unit: Unit.VOLT },
    { name: "I", value: 0.005, unit: Unit.AMPERE },
    { name: "P", value: 0.025, unit: Unit.WATT },
  ]);
});
