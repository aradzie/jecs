import test from "ava";
import { Circuit } from "../circuit";
import { Resistor } from "./resistor";
import { VCISource } from "./vcisource";
import { VSource } from "./vsource";

test("voltage controlled current source", (t) => {
  const circuit = new Circuit();
  const ng = circuit.groundNode;
  const nib = circuit.allocNode("NIB");
  const nob = circuit.allocNode("NOB");
  circuit.addDevice(
    new VSource([ng, nib], {
      name: "V1",
      v: 3.0,
    }),
    new VCISource([ng, nib, ng, nob], {
      name: "VCI1",
      gain: 0.5,
    }),
    new Resistor([ng, nob], {
      name: "R1",
      r: 100.0,
    }),
  );
  const r = circuit.dc();
  t.deepEqual(
    r,
    new Map([
      ["V[GROUND]", 0],
      ["V[NIB]", 3],
      ["V[NOB]", 150],
      ["I[GROUND->NIB]", 0],
    ]),
  );
});
