import test from "ava";
import { Circuit } from "./circuit";
import { createDevice } from "./devicemap";

test("create device", (t) => {
  const circuit = new Circuit();
  const n1 = circuit.allocNode("N1");
  const n2 = circuit.allocNode("N2");
  t.notThrows(() => {
    createDevice("v", "V1", [n1, n2], { v: 1 });
  });
  t.throws(
    () => {
      createDevice("x", "X1", [], {});
    },
    { message: "Unknown device id [x]" },
  );
  t.throws(
    () => {
      createDevice("v", "V1", [], { v: 1 });
    },
    { message: "Error in device [v:V1]: Invalid number of nodes" },
  );
  t.throws(
    () => {
      createDevice("v", "V1", [n1, n2], {});
    },
    { message: "Error in device [v:V1]: Missing property [v]" },
  );
});
