import test from "ava";
import { CSource, Resistor, VSource } from "../device";
import { Circuit } from "./circuit";
import { dcAnalysis } from "./dc";

test("`is` in series with `r`", (t) => {
  const circuit = new Circuit();
  const ng = circuit.groundNode;
  const n1 = circuit.allocNode("N1");
  circuit.addDevice(
    new CSource("I1", [n1, ng], {
      i: 0.001,
    }),
    new Resistor("R1", [n1, ng], {
      r: 1000,
    }),
  );
  const r = dcAnalysis(circuit);
  t.deepEqual(r, new Map([["V[N1]", -1]]));
});

test("`is` in series with `r` in series with `r`", (t) => {
  const circuit = new Circuit();
  const ng = circuit.groundNode;
  const n1 = circuit.allocNode("N1");
  const n2 = circuit.allocNode("N2");
  circuit.addDevice(
    new CSource("I1", [n2, ng], {
      i: 0.001,
    }),
    new Resistor("R1", [ng, n1], {
      r: 300,
    }),
    new Resistor("R2", [n1, n2], {
      r: 700,
    }),
  );
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[N1]", -0.3],
      ["V[N2]", -1],
    ]),
  );
});

test("`vs` in series with `r`", (t) => {
  const circuit = new Circuit();
  const ng = circuit.groundNode;
  const n1 = circuit.allocNode("N1");
  circuit.addDevice(
    new VSource("V1", [n1, ng], {
      v: 10,
    }),
    new Resistor("R1", [n1, ng], {
      r: 1000,
    }),
  );
  const r = dcAnalysis(circuit);
  t.deepEqual(r, new Map([["V[N1]", 10]]));
});

test("`vs` in series with `r` in series with `r`", (t) => {
  const circuit = new Circuit();
  const ng = circuit.groundNode;
  const n1 = circuit.allocNode("N1");
  const n2 = circuit.allocNode("N2");
  circuit.addDevice(
    new VSource("V1", [n2, ng], {
      v: 10,
    }),
    new Resistor("R1", [ng, n1], {
      r: 300,
    }),
    new Resistor("R2", [n1, n2], {
      r: 700,
    }),
  );
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[N1]", 2.9999999999999996],
      ["V[N2]", 10],
    ]),
  );
});

test("`vs` in series with `vs` in series with `r`", (t) => {
  const circuit = new Circuit();
  const ng = circuit.groundNode;
  const n1 = circuit.allocNode("N1");
  const n2 = circuit.allocNode("N2");
  circuit.addDevice(
    new VSource("V1", [n1, ng], {
      v: 10,
    }),
    new VSource("V2", [n2, n1], {
      v: 10,
    }),
    new Resistor("R1", [n2, ng], {
      r: 1000,
    }),
  );
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[N1]", 10],
      ["V[N2]", 20],
    ]),
  );
});
