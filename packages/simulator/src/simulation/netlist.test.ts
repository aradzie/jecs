import test from "ava";
import type { VSource } from "../device/vsource";
import { readNetlist } from "./netlist";

test("read netlist, find explicit ground node", (t) => {
  const circuit = readNetlist([
    ["g/GROUND", ["g"], {}],
    ["v/V1", ["g", "n1"], { v: 5 }],
    ["r/R1", ["g", "n1"], { r: 1000 }],
  ]);

  t.is(circuit.nodes.length, 2);
  t.is(circuit.devices.length, 3);
  const device = circuit.devices[1] as VSource;
  t.is(device.name, "V1");
  t.is(device.a, circuit.groundNode);
});

test("read netlist, assign implicit ground node", (t) => {
  const circuit = readNetlist([
    ["v/V1", ["n0", "n1"], { v: 2.5 }],
    ["v/V2", ["n1", "n2"], { v: 2.5 }],
    ["r/R1", ["n0", "n2"], { r: 1000 }],
  ]);

  t.is(circuit.nodes.length, 4);
  t.is(circuit.devices.length, 3);
  const device = circuit.devices[0] as VSource;
  t.is(device.name, "V1");
  t.is(device.a, circuit.groundNode);
});
