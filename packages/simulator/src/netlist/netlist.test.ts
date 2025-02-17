import { test } from "node:test";
import { deepEqual, equal, isInstanceOf } from "rich-assert";
import { AcAnalysis } from "../analysis/analysis-ac.js";
import { DcAnalysis } from "../analysis/analysis-dc.js";
import { TrAnalysis } from "../analysis/analysis-tr.js";
import { type Branch, type Node } from "../circuit/network.js";
import { Netlist } from "./netlist.js";

test("parse netlist", () => {
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
  .sweep $R1 type="lin" start=1 stop=5 points=5
  .sweep $R2 type="lin" start=1 stop=10 points=10
.tr
  maxIter=10
  startTime=0.5m
  stopTime=1m
  timeStep=1u
  .sweep $R1 type="lin" start=1 stop=5 points=5
  .sweep $R2 type="lin" start=1 stop=10 points=10
.ac
  type="lin"
  start=1
  stop=1M
  points=1M
  .sweep $R1 type="lin" start=1 stop=5 points=5
  .sweep $R2 type="lin" start=1 stop=10 points=10
`;

  // Act.

  const { circuit, analyses } = Netlist.parse(content);
  const { nodes, devices, equations } = circuit;

  // Assert equations.

  deepEqual([...equations], ["pi", "e", "V", "a", "b", "c"]);
  equal(equations.get("pi").eval(equations), Math.PI);
  equal(equations.get("e").eval(equations), Math.E);
  equal(equations.get("V").eval(equations), 5);
  equal(equations.get("a").eval(equations), 1);
  equal(equations.get("b").eval(equations), 3);
  equal(equations.get("c").eval(equations), -1);

  // Assert nodes.

  equal(nodes.length, 2);

  const [n1, n2] = nodes;

  equal(n1.type, "node");
  equal((n1 as Node).id, "n1");
  equal(n2.type, "branch");
  equal((n2 as Branch).a.id, "n1");
  equal((n2 as Branch).b.id, "gnd");

  // Assert devices.

  equal(devices.length, 4);

  const [d1, d2, d3, d4] = devices;

  equal(d1.deviceClass.id, "V");
  equal(d1.id, "V1");
  equal(d1.props.getNumber("V"), 5);

  equal(d2.deviceClass.id, "R");
  equal(d2.id, "R1");

  equal(d3.deviceClass.id, "R");
  equal(d3.id, "R2");

  equal(d4.deviceClass.id, "R");
  equal(d4.id, "R3");

  // Assert analyses.

  equal(analyses.length, 3);

  const [dc, tr, ac] = analyses;

  isInstanceOf(dc, DcAnalysis);
  equal(dc.props.getNumber("maxIter"), 20);

  isInstanceOf(tr, TrAnalysis);
  equal(tr.props.getNumber("maxIter"), 10);
  equal(tr.props.getNumber("startTime"), 5e-4);
  equal(tr.props.getNumber("stopTime"), 1e-3);
  equal(tr.props.getNumber("timeStep"), 1e-6);

  isInstanceOf(ac, AcAnalysis);
  equal(ac.props.getString("type"), "lin");
  equal(ac.props.getNumber("start"), 1);
  equal(ac.props.getNumber("stop"), 1e6);
  equal(ac.props.getNumber("points"), 1e6);
});
