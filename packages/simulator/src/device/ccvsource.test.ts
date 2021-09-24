import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { dumpCircuit } from "../simulation/debug";
import { readNetlist } from "../simulation/netlist";

test("current controlled voltage source", (t) => {
  const circuit = readNetlist([
    ["g", ["NCN"], {}],
    ["g", ["NON"], {}],
    ["i", ["NCP", "NCN"], { i: -1 }],
    ["ccvs/DUT", ["NOP", "NON", "NCP", "NCN"], { gain: 2 }],
    ["r", ["NOP", "NON"], { r: 10 }],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NCP)=0V",
    "V(NOP)=2V",
    "I1{Vd=0V,I=-1A}",
    "DUT{Vd=2V,I=-200mA,P=-400mW}",
    "R1{Vd=2V,I=200mA,P=400mW}",
  ]);
});
