import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../util/unit";

test("current controlled voltage source", (t) => {
  const circuit = readNetlist([
    ["g", ["NCN"], {}],
    ["g", ["NON"], {}],
    ["i", ["NCP", "NCN"], { i: -1 }],
    ["ccvs/DUT", ["NOP", "NON", "NCP", "NCN"], { gain: 2 }],
    ["r", ["NOP", "NON"], { r: 10 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[NCP]", -0],
      ["V[NOP]", 2],
    ]),
  );
  const dut = circuit.getDevice("DUT");
  t.deepEqual(dut.details(), [
    { name: "Vd", value: 2, unit: Unit.VOLT },
    { name: "I", value: -0.2, unit: Unit.AMPERE },
    { name: "P", value: -0.4, unit: Unit.WATT },
  ]);
});
