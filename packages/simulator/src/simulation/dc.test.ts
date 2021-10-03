import test from "ava";
import { Circuit } from "../circuit/circuit";
import { dumpCircuit } from "../circuit/debug";
import { CSource, Resistor, VSource } from "../device";
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
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(N1)=-1V",
    "I1{Vd=-1V,I=1mA}",
    "R1{Vd=-1V,I=-1mA,P=1mW}",
  ]);
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
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(N1)=-300mV",
    "V(N2)=-1V",
    "I1{Vd=-1V,I=1mA}",
    "R1{Vd=300mV,I=1mA,P=300μW}",
    "R2{Vd=700mV,I=1mA,P=700μW}",
  ]);
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
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(N1)=10V",
    "V1{Vd=10V,I=-10mA,P=-100mW}",
    "R1{Vd=10V,I=10mA,P=100mW}",
  ]);
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
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(N1)=3V",
    "V(N2)=10V",
    "V1{Vd=10V,I=-10mA,P=-100mW}",
    "R1{Vd=-3V,I=-10mA,P=30mW}",
    "R2{Vd=-7V,I=-10mA,P=70mW}",
  ]);
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
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(N1)=10V",
    "V(N2)=20V",
    "V1{Vd=10V,I=-20mA,P=-200mW}",
    "V2{Vd=10V,I=-20mA,P=-200mW}",
    "R1{Vd=20V,I=20mA,P=400mW}",
  ]);
});
