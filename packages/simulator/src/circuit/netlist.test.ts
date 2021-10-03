import test from "ava";
import type { VSource } from "../device";
import { readNetlist } from "./netlist";

test("read netlist, find explicit ground node", (t) => {
  const circuit = readNetlist([
    ["g/GROUND", ["g"], {}],
    ["v/V1", ["NP", "g"], { v: 5 }],
    ["r/R1", ["NP", "g"], { r: 1000 }],
  ]);

  t.is(circuit.nodes.length, 2);
  t.is(circuit.devices.length, 3);
  const device = circuit.devices[1] as VSource;
  t.is(device.name, "V1");
  t.is(device.nn, circuit.groundNode);
});

test("read netlist, assign implicit ground node", (t) => {
  const circuit = readNetlist([
    ["v/V1", ["N1", "N0"], { v: 2.5 }],
    ["v/V2", ["N2", "N1"], { v: 2.5 }],
    ["r/R1", ["N2", "N0"], { r: 1000 }],
  ]);

  t.is(circuit.nodes.length, 4);
  t.is(circuit.devices.length, 3);
  const device = circuit.devices[0] as VSource;
  t.is(device.name, "V1");
  t.is(device.nn, circuit.groundNode);
});
