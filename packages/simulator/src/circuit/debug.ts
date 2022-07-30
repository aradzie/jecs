import { humanizeNumber } from "../util/format.js";
import type { Circuit } from "./circuit.js";

export function dumpCircuit(circuit: Circuit): string[] {
  const lines: string[] = [];
  for (const node of circuit.nodes) {
    switch (node.type) {
      case "node":
        for (const probe of node.probes) {
          lines.push(`${probe.unit}(${node.id})=${humanizeNumber(node.voltage, probe.unit)}`);
        }
        break;
    }
  }
  for (const device of circuit.devices) {
    const items: string[] = [];
    for (const probe of device.probes) {
      items.push(`${probe.name}=${humanizeNumber(probe.measure(), probe.unit)}`);
    }
    lines.push(`${device.id}{${items.join(",")}}`);
  }
  return lines;
}
