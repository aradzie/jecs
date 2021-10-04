import test from "ava";
import { dumpCircuit } from "../circuit/debug";
import { readNetlist } from "../netlist/netlist";
import { dcAnalysis } from "../simulation/dc";

test("resistor", (t) => {
  const circuit = readNetlist([
    ["v", ["NP", "g"], { v: 5 }],
    ["r:DUT", ["NP", "g"], { r: 1000 }],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NP)=5V",
    "V1{Vd=5V,I=-5mA,P=-25mW}",
    "DUT{Vd=5V,I=5mA,P=25mW}",
  ]);
});
