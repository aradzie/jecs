import test from "ava";
import { parseNetlist } from "./netlist.js";
import { parse } from "./parser.js";

test("parse netlist text", (t) => {
  const circuit = parseNetlist(`
ground NG;
v:V1 np ng v=5;
r:R1 Np Ng r=1000;
`);

  t.is(circuit.nodes.length, 2);
  t.is(circuit.devices.length, 3);
  const device = circuit.devices[1];
  t.is(device.id, "V1");
  t.is(device.nodes[1], circuit.groundNode);
});

test("parse netlist object", (t) => {
  const netlist = parse(`
Ground ng;
V:V1 np ng V=5;
R:R1 np ng R=1000;
`);

  const circuit = parseNetlist(netlist);

  t.is(circuit.nodes.length, 2);
  t.is(circuit.devices.length, 3);
  const device = circuit.devices[1];
  t.is(device.id, "V1");
  t.is(device.nodes[1], circuit.groundNode);
});

test("assign unique instance ids", (t) => {
  const netlist = parse(`
Ground g;
V np g V=5;
R np g R=1000;
R np g R=1000;
R:R1 np g R=1000;
`);

  const circuit = parseNetlist(netlist);

  t.is(circuit.nodes.length, 2);
  t.is(circuit.devices.length, 5);
  t.is(circuit.devices[1].id, "V1");
  t.is(circuit.devices[2].id, "R2");
  t.is(circuit.devices[3].id, "R3");
  t.is(circuit.devices[4].id, "R1");
});
