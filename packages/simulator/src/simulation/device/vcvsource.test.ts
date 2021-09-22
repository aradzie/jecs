import test from "ava";
import { Circuit } from "../circuit";
import { Resistor } from "./resistor";
import { VCVSource } from "./vcvsource";
import { VSource } from "./vsource";

test("voltage controlled voltage source", (t) => {
  const circuit = new Circuit();
  const ng = circuit.groundNode;
  const nib = circuit.allocNode("NIB");
  const nob = circuit.allocNode("NOB");
  circuit.addDevice(
    new VSource([ng, nib], {
      name: "V1",
      v: 3.0,
    }),
    new VCVSource([ng, nib, ng, nob], {
      name: "VCV1",
      gain: 0.5,
    }),
    new Resistor([ng, nob], {
      name: "R1",
      r: 1000.0,
    }),
  );
  const r = circuit.dc();
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[NIB]", 3],
      ["V[NOB]", 1.5],
      ["I[GROUND->NIB]", 0],
      ["I[GROUND->NOB]", -0.0015],
    ]),
  );
});
