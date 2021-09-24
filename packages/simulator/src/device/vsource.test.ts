import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { readNetlist } from "../simulation/netlist";
import { Unit } from "../util/unit";

test("voltage source", (t) => {
  const circuit = readNetlist([
    ["g", ["NN"], {}],
    ["v/DUT", ["NP", "NN"], { v: 5 }],
    ["r", ["NP", "NN"], { r: 1000 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[NP]", 5],
      ["I[NP->GROUND]", -0.005],
    ]),
  );
  const dut = circuit.getDevice("DUT");
  t.deepEqual(dut.details(), [
    { name: "Vd", value: 5, unit: Unit.VOLT },
    { name: "I", value: -0.005, unit: Unit.AMPERE },
    { name: "P", value: -0.025, unit: Unit.WATT },
  ]);
});

test("short circuit", (t) => {
  const circuit = readNetlist([
    ["g", ["G"], {}],
    ["v/DUT", ["G", "G"], { v: 5 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(r, new Map([["I[GROUND->GROUND]", Infinity]]));
});

test("open circuit", (t) => {
  const circuit = readNetlist([
    ["g", ["G"], {}],
    ["v/DUT", ["N1", "G"], { v: 5 }],
  ]);
  const r = dcAnalysis(circuit);
  t.deepEqual(
    r,
    new Map([
      ["V[N1]", 5],
      ["I[N1->GROUND]", 0],
    ]),
  );
});
