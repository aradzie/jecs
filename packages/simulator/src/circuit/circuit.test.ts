import { test } from "node:test";
import { deepEqual, throws } from "rich-assert";
import { Circuit } from "./circuit.js";
import { Device } from "./device.js";

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
  class X extends Device {
    static override readonly id = "X";
    static override readonly numTerminals = 2;
    static override readonly propsSchema = {};
    static override readonly stateSchema = {
      length: 0,
      ops: [],
    };
  }

  const circuit = new Circuit();
  const n1 = circuit.makeNode("N1");
  const n2 = circuit.makeNode("N2");
  const r = new X("X1");

  deepEqual(circuit.devices, []);

  circuit.connect(r, [n1, n2]);

  deepEqual(circuit.devices, [r]);

  throws(
    () => {
      circuit.connect(r, [n1, n2]);
    },
    { message: "Duplicate device instance [X1]" },
  );

  deepEqual(circuit.devices, [r]);
});
