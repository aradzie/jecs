import test from "ava";
import { Bjt } from "../device";
import { Temp } from "../device/const";
import { Circuit } from "./circuit";
import { createDevice } from "./library";

test("create device", (t) => {
  const circuit = new Circuit();
  const n1 = circuit.allocNode("N1");
  const n2 = circuit.allocNode("N2");
  t.notThrows(() => {
    createDevice("V", "V1", [n1, n2], { V: 1 });
  });
  t.throws(
    () => {
      createDevice("X", "X1", [], {});
    },
    { message: "Unknown device id [X]" },
  );
  t.throws(
    () => {
      createDevice("V", "V1", [], { V: 1 });
    },
    { message: "Error in device [V:V1]: Invalid number of nodes" },
  );
  t.throws(
    () => {
      createDevice("V", "V1", [n1, n2], {});
    },
    { message: "Error in device [V:V1]: Missing parameter [V]" },
  );
});

test("create device from model", (t) => {
  const circuit = new Circuit();
  const n1 = circuit.allocNode("N1");
  const n2 = circuit.allocNode("N2");
  const n3 = circuit.allocNode("N3");
  const nodes = [n1, n2, n3];
  {
    const dev = createDevice("BJT", "Q1", nodes, "NPN");
    t.true(dev instanceof Bjt);
    t.like((dev as Bjt).params, {
      polarity: "npn",
      Temp,
    });
  }
  {
    const dev = createDevice("BJT", "Q1", nodes, "NPN", { Temp: 100 });
    t.true(dev instanceof Bjt);
    t.like((dev as Bjt).params, {
      polarity: "npn",
      Temp: 100,
    });
  }
  {
    const dev = createDevice("BJT", "Q1", nodes, { Temp: 100 }, "NPN");
    t.true(dev instanceof Bjt);
    t.like((dev as Bjt).params, {
      polarity: "npn",
      Temp,
    });
  }
});
