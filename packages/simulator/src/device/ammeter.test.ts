import test from "ava";
import { dumpCircuit } from "../circuit/debug";
import { readNetlist } from "../netlist/netlist";
import { dcAnalysis } from "../simulation/dc";

test("ammeter", (t) => {
  const circuit = readNetlist([
    ["g", ["NA"], {}],
    ["v", ["NB", "NA"], { v: 5 }],
    ["ammeter:DUT", ["NB", "NC"], {}],
    ["r", ["NC", "NA"], { r: 1000 }],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NB)=5V",
    "V(NC)=5V",
    "V1{Vd=5V,I=-5mA,P=-25mW}",
    "DUT{I=5mA}",
    "R1{Vd=5V,I=5mA,P=25mW}",
  ]);
});
