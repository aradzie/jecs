import { test } from "node:test";
import { deepEqual, throws } from "rich-assert";
import { Resistor } from "../device/index.js";
import { Circuit } from "./circuit.js";

test("make node", () => {
  const circuit = new Circuit();

  deepEqual(circuit.nodes, []);

  const n1 = circuit.makeNode("N1");

  deepEqual(circuit.nodes, [n1]);

  throws(
    () => {
      circuit.makeNode("N1");
    },
    { message: "Duplicate node [N1]" },
  );

  deepEqual(circuit.nodes, [n1]);
});

test("add device", () => {
  const circuit = new Circuit();
  const n1 = circuit.makeNode("N1");
  const n2 = circuit.makeNode("N2");
  const r = new Resistor("R1");

  deepEqual(circuit.devices, []);

  circuit.connect(r, [n1, n2]);

  deepEqual(circuit.devices, [r]);

  throws(
    () => {
      circuit.connect(r, [n1, n2]);
    },
    { message: "Duplicate device instance [R1]" },
  );

  deepEqual(circuit.devices, [r]);
});
