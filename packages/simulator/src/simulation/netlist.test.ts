import test from "ava";
import { readNetList } from "./netlist";

test("netlist", (t) => {
  const circuit = readNetList([
    ["g", ["g"], { name: "GROUND" }],
    ["v", ["n0", "g"], { name: "V1", v: 5 }],
    ["r", ["n0", "g"], { name: "R1", r: 1000 }],
  ]);

  t.is(circuit.nodes.length, 3);
  t.is(circuit.devices.length, 3);
});
