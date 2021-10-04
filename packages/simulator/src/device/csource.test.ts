import test from "ava";
import { dumpCircuit } from "../circuit/debug";
import { readNetlist } from "../netlist/netlist";
import { dcAnalysis } from "../simulation/dc";

test("current source", (t) => {
  const circuit = readNetlist([
    ["g", ["NN"], {}],
    ["i:DUT", ["NP", "NN"], { i: -1 }],
    ["r:R1", ["NP", "NN"], { r: 10 }],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NP)=10V",
    "DUT{Vd=10V,I=-1A}",
    "R1{Vd=10V,I=1A,P=10W}",
  ]);
});
