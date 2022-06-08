import test from "ava";
import type { Branch, Node } from "../circuit/network.js";
import { DcAnalysis, TranAnalysis } from "../simulation/analysis.js";
import { Netlist } from "./netlist.js";

test("parse netlist", (t) => {
  // Arrange.

  const content = `
# An example netlist.
V n1 gnd V=$V
R n1 gnd @R2
R n1 gnd @R3 R=200
R:R1 n1 gnd R=100
.model R @R2 R=111
.model R @R3 R=222
.eq $V=5
.dc
.tran timeInterval=1m timeStep=1u
`;

  // Act.

  const { circuit, analyses } = Netlist.parse(content);
  const { nodes, devices } = circuit;

  // Assert nodes.

  t.is(nodes.length, 2);

  const [n1, n2] = nodes;

  t.is(n1.type, "node");
  t.is((n1 as Node).id, "n1");
  t.is(n2.type, "branch");
  t.is((n2 as Branch).a.id, "n1");
  t.is((n2 as Branch).b.id, "gnd");

  // Assert devices.

  t.is(devices.length, 4);

  const [d1, d2, d3, d4] = devices;

  t.is(d1.deviceClass.id, "V");
  t.is(d1.id, "V1");
  t.is(d1.properties.getNumber("V"), 5);

  t.is(d2.deviceClass.id, "R");
  t.is(d2.id, "R2");
  t.is(d2.properties.getNumber("R"), 111);

  t.is(d3.deviceClass.id, "R");
  t.is(d3.id, "R3");
  t.is(d3.properties.getNumber("R"), 200);

  t.is(d4.deviceClass.id, "R");
  t.is(d4.id, "R1");
  t.is(d4.properties.getNumber("R"), 100);

  // Assert analyses.

  t.is(analyses.length, 2);

  const [dc, tran] = analyses;

  t.true(dc instanceof DcAnalysis);
  t.true(tran instanceof TranAnalysis);
  t.is(tran.properties.getNumber("timeInterval"), 1e-3);
  t.is(tran.properties.getNumber("timeStep"), 1e-6);
});
