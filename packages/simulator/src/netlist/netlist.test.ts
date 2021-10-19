import test from "ava";
import { parseNetlist } from "./netlist";
import { parse } from "./parser";

test("parse netlist text", (t) => {
  const circuit = parseNetlist(`
Ground:GROUND [NG];
V:V1 [NP NG] v=5;
R:R1 [NP NG] r=1000;
`);

  t.is(circuit.nodes.length, 2);
  t.is(circuit.devices.length, 3);
  const device = circuit.devices[1];
  t.is(device.name, "V1");
  t.is(device.nodes[1], circuit.groundNode);
});

test("parse netlist object", (t) => {
  const netlist = parse(`
Ground:GROUND [NG];
V:V1 [NP NG] v=5;
R:R1 [NP NG] r=1000;
`);

  const circuit = parseNetlist(netlist);

  t.is(circuit.nodes.length, 2);
  t.is(circuit.devices.length, 3);
  const device = circuit.devices[1];
  t.is(device.name, "V1");
  t.is(device.nodes[1], circuit.groundNode);
});

test("assign unique instance ids", (t) => {
  const netlist = parse(`
Ground:GROUND [g];
V [NP g] v=5;
R [NP g] r=1000;
R [NP g] r=1000;
R:R1 [NP g] r=1000;
`);

  const circuit = parseNetlist(netlist);

  t.is(circuit.nodes.length, 2);
  t.is(circuit.devices.length, 5);
  t.is(circuit.devices[1].name, "V1");
  t.is(circuit.devices[2].name, "R2");
  t.is(circuit.devices[3].name, "R3");
  t.is(circuit.devices[4].name, "R1");
});
