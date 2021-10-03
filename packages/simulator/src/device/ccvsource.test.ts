import test from "ava";
import { dumpCircuit } from "../circuit/debug";
import { readNetlist } from "../circuit/netlist";
import { dcAnalysis } from "../simulation/dc";

test("current controlled voltage source", (t) => {
  const circuit = readNetlist([
    ["g", ["NCN"], {}],
    ["g", ["NON"], {}],
    ["i", ["NCP", "NCN"], { i: -1 }],
    ["ccvs/DUT", ["NOP", "NON", "NCP", "NCN"], { gain: 10 }],
    ["r", ["NOP", "NON"], { r: 10 }],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NCP)=0V",
    "V(NOP)=10V",
    "I1{Vd=0V,I=-1A}",
    "DUT{Vd=10V,I=-1A,P=-10W}",
    "R1{Vd=10V,I=1A,P=10W}",
  ]);
});
