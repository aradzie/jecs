import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../util/unit";

test("ammeter", (t) => {
  const circuit = readNetlist([
    ["g", ["NA"], {}],
    ["v", ["NB", "NA"], { v: 5 }],
    ["ammeter/DUT", ["NB", "NC"], {}],
    ["r", ["NC", "NA"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[NB]", 5],
      ["I[NB->GROUND]", -0.005],
      ["V[NC]", 5],
      ["I[NB->NC]", 0.005],
    ]),
  );
  const dut = circuit.getDevice("DUT");
  t.deepEqual(dut.details(), [{ name: "I", value: 0.005, unit: Unit.AMPERE }]);
});
