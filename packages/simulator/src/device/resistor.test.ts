import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { dumpCircuit } from "../simulation/debug";
import { readNetlist } from "../simulation/netlist";

test("resistor", (t) => {
  const circuit = readNetlist([
    ["v", ["NP", "g"], { v: 5 }],
    ["r/DUT", ["NP", "g"], { r: 1000 }],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NP)=5V",
    "V1{Vd=5V,I=-5mA,P=-25mW}",
    "DUT{Vd=5V,I=5mA,P=25mW}",
  ]);
});
