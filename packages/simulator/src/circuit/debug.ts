import { humanizeNumber } from "../util/format.js";
import { units } from "../util/unit.js";
import type { Circuit } from "./circuit.js";

export function dumpCircuit(circuit: Circuit): string[] {
  const lines: string[] = [];
  for (const node of circuit.nodes) {
    switch (node.type) {
      case "node":
        lines.push(`V(${node.id})=${humanizeNumber(node.voltage, units.volt)}`);
        break;
    }
  }
  for (const device of circuit.devices) {
    const items: string[] = [];
    const { stateSchema } = device.deviceClass;
    for (const op of stateSchema.ops) {
      items.push(`${op.name}=${humanizeNumber(device.state[op.index], op.unit)}`);
    }
    lines.push(`${device.id}{${items.join(",")}}`);
  }
  return lines;
}
