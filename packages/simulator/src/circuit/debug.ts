import { Ground } from "../device/index.js";
import { formatNumber } from "../util/format.js";
import { Unit } from "../util/unit.js";
import type { Circuit } from "./circuit.js";

export function dumpCircuit(circuit: Circuit): string[] {
  const lines: string[] = [];
  for (const node of circuit.nodes) {
    switch (node.type) {
      case "node":
        lines.push(`V(${node.id})=${formatNumber(node.voltage, Unit.VOLT)}`);
        break;
    }
  }
  for (const device of circuit.devices) {
    if (device instanceof Ground) {
      continue;
    }
    const items: string[] = [];
    const { stateSchema } = device.deviceClass;
    for (const op of stateSchema.ops) {
      items.push(`${op.name}=${formatNumber(device.state[op.index], op.unit)}`);
    }
    lines.push(`${device.id}{${items.join(",")}}`);
  }
  return lines;
}
