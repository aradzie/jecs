import test from "ava";
import { Resistor } from "../device";
import { Circuit } from "./circuit";

test("alloc node", (t) => {
  const circuit = new Circuit();

  t.deepEqual(circuit.nodes, []);

  const n1 = circuit.allocNode("N1");

  t.deepEqual(circuit.nodes, [n1]);

  t.throws(
    () => {
      circuit.allocNode("N1");
    },
    { message: "Duplicate node name [N1]" },
  );

  t.deepEqual(circuit.nodes, [n1]);
});

test("add device", (t) => {
  const circuit = new Circuit();
  const n1 = circuit.allocNode("N1");
  const n2 = circuit.allocNode("N2");
  const r = new Resistor("R1", [n1, n2], { R: 100 });

  t.deepEqual(circuit.devices, []);

  circuit.addDevice(r);

  t.deepEqual(circuit.devices, [r]);

  t.throws(
    () => {
      circuit.addDevice(r);
    },
    { message: "Duplicate device name [R1]" },
  );

  t.deepEqual(circuit.devices, [r]);
});
