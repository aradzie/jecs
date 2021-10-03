import test from "ava";
import { dumpCircuit } from "../circuit/debug";
import { readNetlist } from "../circuit/netlist";
import { dcAnalysis } from "../simulation/dc";

test("voltage controlled current source", (t) => {
  const circuit = readNetlist([
    ["g", ["NCN"], {}],
    ["g", ["NON"], {}],
    ["v", ["NCP", "NCN"], { v: 1 }],
    ["vccs/DUT", ["NOP", "NON", "NCP", "NCN"], { gain: 2 }],
    ["r", ["NOP", "NON"], { r: 10 }],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NCP)=1V",
    "V(NOP)=-20V",
    "V1{Vd=1V,I=0A,P=0W}",
    "DUT{Vd=-20V,I=2A}",
    "R1{Vd=-20V,I=-2A,P=40W}",
  ]);
});
