import { Circuit } from "./circuit";
import type { RawDeviceProps } from "./device/device";
import { createDevice } from "./device/devicemap";
import { Ground } from "./device/ground";
import { VSource } from "./device/vsource";
import type { Node } from "./network";

export type Netlist = readonly NetlistItem[];

export type NetlistItem = readonly [
  id: string,
  connections: readonly string[],
  rawProps: RawDeviceProps,
];

export function readNetlist(netlist: Netlist): Circuit {
  const circuit = new Circuit();

  const nodeMap = new Map<string, Node>();

  // Find ground nodes.
  for (const [id, connections] of netlist) {
    if (id === Ground.id) {
      const [node] = connections;
      nodeMap.set(node, circuit.groundNode);
    }
  }

  // If ground node is not set explicitly, then ground the negative terminal
  // of the first voltage source.
  if (nodeMap.size === 0) {
    for (const [id, connections] of netlist) {
      if (id === VSource.id) {
        const [node] = connections;
        nodeMap.set(node, circuit.groundNode);
        break;
      }
    }
  }

  // Create and connect devices.
  for (const [id, connections, rawProps] of netlist) {
    const nodes = connections.map((name) => {
      let node = nodeMap.get(name) ?? null;
      if (node == null) {
        nodeMap.set(name, (node = circuit.allocNode(name)));
      }
      return node;
    });
    circuit.addDevice(createDevice(id, nodes, rawProps));
  }

  return circuit;
}
