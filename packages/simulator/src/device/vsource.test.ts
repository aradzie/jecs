import test from "ava";
import { dumpCircuit } from "../circuit/debug";
import { readNetlist } from "../circuit/netlist";
import { dcAnalysis } from "../simulation/dc";

test("voltage source", (t) => {
  const circuit = readNetlist([
    ["g", ["NN"], {}],
    ["v/DUT", ["NP", "NN"], { v: 5 }],
    ["r", ["NP", "NN"], { r: 1000 }],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NP)=5V",
    "DUT{Vd=5V,I=-5mA,P=-25mW}",
    "R1{Vd=5V,I=5mA,P=25mW}",
  ]);
});
