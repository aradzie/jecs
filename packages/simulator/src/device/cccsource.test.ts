import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { dumpCircuit } from "../simulation/debug";
import { readNetlist } from "../simulation/netlist";

test("current controlled current source", (t) => {
  const circuit = readNetlist([
    ["g", ["NCN"], {}],
    ["g", ["NON"], {}],
    ["i", ["NCP", "NCN"], { i: 1 }],
    ["cccs/DUT", ["NOP", "NON", "NCP", "NCN"], { gain: 2 }],
    ["r", ["NOP", "NON"], { r: 5 }],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NCP)=0V",
    "V(NOP)=10V",
    "I1{Vd=0V,I=1A}",
    "DUT{Vd=10V,I=-2A}",
    "R1{Vd=10V,I=2A,P=20W}",
  ]);
});
