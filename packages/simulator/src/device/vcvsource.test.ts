import test from "ava";
import { dumpCircuit } from "../circuit/debug";
import { readNetlist } from "../circuit/netlist";
import { dcAnalysis } from "../simulation/dc";

test("voltage controlled voltage source", (t) => {
  const circuit = readNetlist([
    ["g", ["NCN"], {}],
    ["g", ["NON"], {}],
    ["v", ["NCP", "NCN"], { v: 5 }],
    ["vcvs/DUT", ["NOP", "NON", "NCP", "NCN"], { gain: 2 }],
    ["r", ["NOP", "NON"], { r: 10 }],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NCP)=5V",
    "V(NOP)=10V",
    "V1{Vd=5V,I=0A,P=0W}",
    "DUT{Vd=10V,I=-1A,P=-10W}",
    "R1{Vd=10V,I=1A,P=10W}",
  ]);
});
