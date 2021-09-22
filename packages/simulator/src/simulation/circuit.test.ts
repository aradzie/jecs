import test from "ava";
import { Circuit } from "./circuit";
import { ISource } from "./device/isource";
import { Resistor } from "./device/resistor";
import { VSource } from "./device/vsource";

test("short circuit", (t) => {
  const circuit = new Circuit();
  const ng = circuit.groundNode;
  circuit.addDevice(
    new VSource([ng, ng], {
      name: "V1",
      v: 1,
    }),
  );
  const r = circuit.dc();
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["I[GROUND->GROUND]", Infinity],
    ]),
  );
});

test("open circuit", (t) => {
  const circuit = new Circuit();
  const ng = circuit.groundNode;
  const n0 = circuit.allocNode("N0");
  circuit.addDevice(
    new VSource([ng, n0], {
      name: "V1",
      v: 1,
    }),
  );
  const r = circuit.dc();
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[N0]", 1],
      ["I[GROUND->N0]", 0],
    ]),
  );
});

test("`is` in series with `r`", (t) => {
  const circuit = new Circuit();
  const ng = circuit.groundNode;
  const n0 = circuit.allocNode("N0");
  circuit.addDevice(
    new ISource([ng, n0], {
      name: "I1",
      i: 0.001,
    }),
    new Resistor([ng, n0], {
      name: "R1",
      r: 1000,
    }),
  );
  const r = circuit.dc();
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[N0]", 1],
    ]),
  );
});

test("`is` in series with `r` in series with `r`", (t) => {
  const circuit = new Circuit();
  const ng = circuit.groundNode;
  const n0 = circuit.allocNode("N0");
  const n1 = circuit.allocNode("N1");
  circuit.addDevice(
    new ISource([ng, n1], {
      name: "I1",
      i: 0.001,
    }),
    new Resistor([ng, n0], {
      name: "R1",
      r: 300,
    }),
    new Resistor([n0, n1], {
      name: "R2",
      r: 700,
    }),
  );
  const r = circuit.dc();
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[N0]", 0.3],
      ["V[N1]", 1],
    ]),
  );
});

test("`vs` in series with `r`", (t) => {
  const circuit = new Circuit();
  const ng = circuit.groundNode;
  const n0 = circuit.allocNode("N0");
  circuit.addDevice(
    new VSource([ng, n0], {
      name: "V1",
      v: 10,
    }),
    new Resistor([ng, n0], {
      name: "R1",
      r: 1000,
    }),
  );
  const r = circuit.dc();
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[N0]", 10],
      ["I[GROUND->N0]", -0.01],
    ]),
  );
});

test("`vs` in series with `r` in series with `r`", (t) => {
  const circuit = new Circuit();
  const ng = circuit.groundNode;
  const n0 = circuit.allocNode("N0");
  const n1 = circuit.allocNode("N1");
  circuit.addDevice(
    new VSource([ng, n1], {
      name: "V1",
      v: 10,
    }),
    new Resistor([ng, n0], {
      name: "R1",
      r: 300,
    }),
    new Resistor([n0, n1], {
      name: "R2",
      r: 700,
    }),
  );
  const r = circuit.dc();
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[N0]", 2.9999999999999996],
      ["V[N1]", 10],
      ["I[GROUND->N1]", -0.01],
    ]),
  );
});

test("`vs` in series with `vs` in series with `r`", (t) => {
  const circuit = new Circuit();
  const ng = circuit.groundNode;
  const n0 = circuit.allocNode("N0");
  const n1 = circuit.allocNode("N1");
  circuit.addDevice(
    new VSource([ng, n0], {
      name: "V1",
      v: 10,
    }),
    new VSource([n0, n1], {
      name: "V2",
      v: 10,
    }),
    new Resistor([ng, n1], {
      name: "R1",
      r: 1000,
    }),
  );
  const r = circuit.dc();
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[N0]", 10],
      ["V[N1]", 20],
      ["I[GROUND->N0]", -0.02],
      ["I[N0->N1]", -0.02],
    ]),
  );
});
