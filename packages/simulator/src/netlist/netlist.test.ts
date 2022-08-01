import test from "ava";
import { DcAnalysis } from "../analysis/analysis-dc.js";
import { TrAnalysis } from "../analysis/analysis-tr.js";
import type { Branch, Node } from "../circuit/network.js";
import { Netlist } from "./netlist.js";

test("parse netlist", (t) => {
  // Arrange.

  const content = `
# An example netlist.
V:V1 n1 gnd V=5
R:R1 n1 gnd R=$R1
R:R2 n1 gnd @R2 R=$R2
R:R3 n1 gnd @R3
.model R @R2 R=111
.model R @R3 R=222
.eq $V = 5
.eq $a = -(-(1))
.eq $b = $a + 2
.eq $c = -+sin($pi / 2)
.dc
  maxIter=20
  sweep $R1 1 5 5
  sweep $R2 1 10 10
.tran
  maxIter=10
  startTime=0.5m
  stopTime=1m
  timeStep=1u
  sweep $R1 1 5 5
  sweep $R2 1 10 10
`;

  // Act.

  const { circuit, analyses } = Netlist.parse(content);
  const { nodes, devices, equations } = circuit;

  // Assert equations.

  t.deepEqual([...equations], ["pi", "e", "V", "a", "b", "c"]);
  t.is(equations.get("pi").eval(equations), Math.PI);
  t.is(equations.get("e").eval(equations), Math.E);
  t.is(equations.get("V").eval(equations), 5);
  t.is(equations.get("a").eval(equations), 1);
  t.is(equations.get("b").eval(equations), 3);
  t.is(equations.get("c").eval(equations), -1);

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
  t.is(d2.id, "R1");

  t.is(d3.deviceClass.id, "R");
  t.is(d3.id, "R2");

  t.is(d4.deviceClass.id, "R");
  t.is(d4.id, "R3");

  // Assert analyses.

  t.is(analyses.length, 2);

  const [dc, tran] = analyses;

  t.true(dc instanceof DcAnalysis);
  t.true(tran instanceof TrAnalysis);
  t.is(dc.properties.getNumber("maxIter"), 20);
  t.is(tran.properties.getNumber("maxIter"), 10);
  t.is(tran.properties.getNumber("startTime"), 5e-4);
  t.is(tran.properties.getNumber("stopTime"), 1e-3);
  t.is(tran.properties.getNumber("timeStep"), 1e-6);
});
