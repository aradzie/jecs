import { Ground } from "../device";
import { formatNumber } from "../util/format";
import { Unit } from "../util/unit";
import type { Circuit } from "./circuit";
import { Node } from "./network";

export function dumpCircuit(circuit: Circuit): string[] {
  const lines: string[] = [];
  for (const node of circuit.nodes) {
    if (node instanceof Node) {
      lines.push(`V(${node.name})=${formatNumber(node.voltage, Unit.VOLT)}`);
      continue;
    }
  }
  for (const device of circuit.devices) {
    if (device instanceof Ground) {
      continue;
    }
    const items: string[] = [];
    for (const { name, value, unit } of device.details()) {
      items.push(`${name}=${formatNumber(value, unit)}`);
    }
    lines.push(`${device.name}{${items.join(",")}}`);
  }
  return lines;
}