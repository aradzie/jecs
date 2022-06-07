import test from "ava";
import type { Branch, Node } from "../circuit/network.js";
import { parseNetlist } from "./netlist.js";
import { parse } from "./parser.js";

test("parse netlist", (t) => {
  // Arrange.

  const netlist = parse(`
Ground gnd;
V n1 gnd V=$V;
R n1 gnd @R2;
R n1 gnd @R3 R=200;
R:R1 n1 gnd R=100;
.model R @R2 R=111;
.model R @R3 R=222;
.eq $V=5;
`);

  // Act.

  const { nodes, devices } = parseNetlist(netlist);

  // Assert nodes.

  t.is(nodes.length, 2);

  const [n1, n2] = nodes;

  t.is(n1.type, "node");
  t.is((n1 as Node).id, "n1");
  t.is(n2.type, "branch");
  t.is((n2 as Branch).a.id, "n1");
  t.is((n2 as Branch).b.id, "g");

  // Assert devices.

  t.is(devices.length, 5);

  const [d1, d2, d3, d4, d5] = devices;

  t.is(d1.getDeviceClass().id, "Ground");
  t.is(d1.id, "Ground1");

  t.is(d2.getDeviceClass().id, "V");
  t.is(d2.id, "V1");
  t.is(d2.properties.getNumber("V"), 5);

  t.is(d3.getDeviceClass().id, "R");
  t.is(d3.id, "R2");
  t.is(d3.properties.getNumber("R"), 111);

  t.is(d4.getDeviceClass().id, "R");
  t.is(d4.id, "R3");
  t.is(d4.properties.getNumber("R"), 200);

  t.is(d5.getDeviceClass().id, "R");
  t.is(d5.id, "R1");
  t.is(d5.properties.getNumber("R"), 100);
});
