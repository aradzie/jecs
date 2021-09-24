import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../util/unit";

test("voltage controlled voltage source", (t) => {
  const circuit = readNetlist([
    ["g", ["NCN"], {}],
    ["g", ["NON"], {}],
    ["v", ["NCP", "NCN"], { v: 5 }],
    ["vcvs/DUT", ["NOP", "NON", "NCP", "NCN"], { gain: 2 }],
    ["r", ["NOP", "NON"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[NCP]", 5],
      ["V[NOP]", 10],
    ]),
  );
  const dut = circuit.getDevice("DUT");
  t.deepEqual(dut.details(), [
    { name: "Vd", value: 10, unit: Unit.VOLT },
    { name: "I", value: -0.01, unit: Unit.AMPERE },
    { name: "P", value: -0.1, unit: Unit.WATT },
  ]);
});
