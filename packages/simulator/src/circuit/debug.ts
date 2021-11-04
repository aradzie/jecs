import { Ground } from "../device";
import { formatNumber } from "../util/format";
import { Unit } from "../util/unit";
import type { Circuit } from "./circuit";

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
    const { stateParams } = device.getDeviceClass();
    for (const op of stateParams.ops) {
      items.push(`${op.name}=${formatNumber(device.state[op.index], op.unit)}`);
    }
    lines.push(`${device.id}{${items.join(",")}}`);
  }
  return lines;
}
