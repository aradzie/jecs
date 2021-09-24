import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../util/unit";

test("voltage controlled current source", (t) => {
  const circuit = readNetlist([
    ["g", ["NCN"], {}],
    ["g", ["NON"], {}],
    ["v", ["NCP", "NCN"], { v: 1 }],
    ["vccs/DUT", ["NOP", "NON", "NCP", "NCN"], { gain: 0.5 }],
    ["r", ["NOP", "NON"], { r: 10 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[NCP]", 1],
      ["V[NOP]", -5],
    ]),
  );
  const dut = circuit.getDevice("DUT");
  t.deepEqual(dut.details(), [
    { name: "Vd", value: -5, unit: Unit.VOLT },
    { name: "I", value: 0.5, unit: Unit.AMPERE },
  ]);
});
