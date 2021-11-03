import { Ground } from "../device";
import { formatNumber } from "../util/format";
import { Unit } from "../util/unit";
import type { Circuit } from "./circuit";
import type { DeviceClass } from "./device";
import { Node } from "./network";

export function dumpCircuit(circuit: Circuit): string[] {
  const lines: string[] = [];
  for (const node of circuit.nodes) {
    if (node instanceof Node) {
      lines.push(`V(${node.id})=${formatNumber(node.voltage, Unit.VOLT)}`);
    }
  }
  for (const device of circuit.devices) {
    if (device instanceof Ground) {
      continue;
    }
    const items: string[] = [];
    const { stateParams } = device.constructor as DeviceClass;
    for (const op of stateParams.outputs) {
      items.push(`${op.name}=${formatNumber(device.state[op.index], op.unit)}`);
    }
    lines.push(`${device.id}{${items.join(",")}}`);
  }
  return lines;
}
