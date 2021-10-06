import test from "ava";
import { Circuit } from "./circuit";
import { createDevice } from "./devicemap";

test("create device", (t) => {
  const circuit = new Circuit();
  const n1 = circuit.allocNode("N1");
  const n2 = circuit.allocNode("N2");
  t.notThrows(() => {
    createDevice("V", "V1", [n1, n2], { v: 1 });
  });
  t.throws(
    () => {
      createDevice("X", "X1", [], {});
    },
    { message: "Unknown device id [X]" },
  );
  t.throws(
    () => {
      createDevice("V", "V1", [], { v: 1 });
    },
    { message: "Error in device [V:V1]: Invalid number of nodes" },
  );
  t.throws(
    () => {
      createDevice("V", "V1", [n1, n2], {});
    },
    { message: "Error in device [V:V1]: Missing property [v]" },
  );
});
