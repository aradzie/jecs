import test from "ava";
import type { VSource } from "../device";
import { parseNetlist } from "./netlist";

test("parse netlist, find explicit ground node", (t) => {
  const circuit = parseNetlist(`
Ground:GROUND [g];
V:V1 [NP g] v=5;
R:R1 [NP g] r=1000;
`);

  t.is(circuit.nodes.length, 2);
  t.is(circuit.devices.length, 3);
  const device = circuit.devices[1] as VSource;
  t.is(device.name, "V1");
  t.is(device.nn, circuit.groundNode);
});
