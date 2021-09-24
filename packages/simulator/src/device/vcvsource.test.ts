import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { dumpCircuit } from "../simulation/debug";
import { readNetlist } from "../simulation/netlist";

test("voltage controlled voltage source", (t) => {
  const circuit = readNetlist([
    ["g", ["NCN"], {}],
    ["g", ["NON"], {}],
    ["v", ["NCP", "NCN"], { v: 5 }],
    ["vcvs/DUT", ["NOP", "NON", "NCP", "NCN"], { gain: 2 }],
    ["r", ["NOP", "NON"], { r: 1000 }],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NCP)=5V",
    "V(NOP)=10V",
    "V1{Vd=5V,I=0A,P=0W}",
    "DUT{Vd=10V,I=-10mA,P=-100mW}",
    "R1{Vd=10V,I=10mA,P=100mW}",
  ]);
});
