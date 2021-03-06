import test from "ava";
import { Resistor } from "../device/index.js";
import { Circuit } from "./circuit.js";

test("make node", (t) => {
  const circuit = new Circuit();

  t.deepEqual(circuit.nodes, []);

  const n1 = circuit.makeNode("N1");

  t.deepEqual(circuit.nodes, [n1]);

  t.throws(
    () => {
      circuit.makeNode("N1");
    },
    { message: "Duplicate node [N1]" },
  );

  t.deepEqual(circuit.nodes, [n1]);
});

test("add device", (t) => {
  const circuit = new Circuit();
  const n1 = circuit.makeNode("N1");
  const n2 = circuit.makeNode("N2");
  const r = new Resistor("R1");

  t.deepEqual(circuit.devices, []);

  circuit.connect(r, [n1, n2]);

  t.deepEqual(circuit.devices, [r]);

  t.throws(
    () => {
      circuit.connect(r, [n1, n2]);
    },
    { message: "Duplicate device instance [R1]" },
  );

  t.deepEqual(circuit.devices, [r]);
});
