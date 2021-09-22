import { Circuit } from "./circuit";
import type { RawDeviceProps } from "./device/device";
import { createDevice } from "./device/devicemap";
import { Ground } from "./device/ground";
import { VSource } from "./device/vsource";
import type { Node } from "./network";

export type Netlist = readonly NetlistItem[];

export type NetlistItem = readonly [
  id: string,
  nodes: readonly string[],
  rawProps: RawDeviceProps,
];

export function readNetlist(netlist: Netlist): Circuit {
  const expNetlist = expandNames(netlist);

  const circuit = new Circuit();

  const nodeMap = new Map<string, Node>();

  const mapNode = (name: string): Node => {
    let node = nodeMap.get(name) ?? null;
    if (node == null) {
      nodeMap.set(name, (node = circuit.allocNode(name)));
    }
    return node;
  };

  // Find ground nodes.
  for (const [id, name, nodes] of expNetlist) {
    if (id === Ground.id) {
      const [node] = nodes;
      nodeMap.set(node, circuit.groundNode);
    }
  }

  // If ground node is not set explicitly, then ground the negative terminal
  // of the first voltage source.
  if (nodeMap.size === 0) {
    for (const [id, name, nodes] of expNetlist) {
      if (id === VSource.id) {
        const [node] = nodes;
        nodeMap.set(node, circuit.groundNode);
        break;
      }
    }
  }

  // Create and connect devices.
  for (const [id, name, nodes, rawProps] of expNetlist) {
    circuit.addDevice(createDevice(id, name, nodes.map(mapNode), rawProps));
  }

  return circuit;
}

function expandNames(
  netlist: Netlist,
): readonly [
  id: string,
  name: string,
  nodes: readonly string[],
  rawProps: RawDeviceProps,
][] {
  const counter = new Map<string, number>();
  return netlist.map(([idName, nodes, rawProps]) => {
    if (idName.indexOf("/") !== -1) {
      const [id, name] = idName.split("/", 2);
      return [id, name, nodes, rawProps];
    } else {
      const prefix = idName.toUpperCase();
      let index = counter.get(prefix) ?? 0;
      counter.set(prefix, (index += 1));
      const name = `${prefix}${index}`;
      return [idName, name, nodes, rawProps];
    }
  });
}
