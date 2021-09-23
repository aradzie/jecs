import { Ground, VSource } from "../device";
import { Circuit } from "./circuit";
import type { DeviceClass } from "./device";
import { createDevice, getDeviceClass } from "./devicemap";
import type { Node } from "./network";
import type { RawDeviceProps } from "./props";

export type Netlist = readonly NetlistItem[];

export type NetlistItem = readonly [
  id: string,
  nodes: readonly string[],
  rawProps: RawDeviceProps,
];

export function readNetlist(netlist: Netlist): Circuit {
  const circuit = new Circuit();

  const nodeMap = new Map<string, Node>();

  const nameToNode = (name: string): Node => {
    let node = nodeMap.get(name) ?? null;
    if (node == null) {
      nodeMap.set(name, (node = circuit.allocNode(name)));
    }
    return node;
  };

  const expNetlist = expandNetlist(netlist);

  // Find ground nodes.
  for (const [deviceClass, name, nodes] of expNetlist) {
    if (deviceClass === Ground) {
      nodeMap.set(nodes[0], circuit.groundNode);
    }
  }

  // If ground node is not set explicitly, then ground the negative terminal
  // of the first voltage source.
  if (nodeMap.size === 0) {
    for (const [deviceClass, name, nodes] of expNetlist) {
      if (deviceClass === VSource) {
        nodeMap.set(nodes[0], circuit.groundNode);
        break;
      }
    }
  }

  // Create and connect devices.
  for (const [deviceClass, name, nodes, rawProps] of expNetlist) {
    circuit.addDevice(
      createDevice(deviceClass, name, nodes.map(nameToNode), rawProps),
    );
  }

  return circuit;
}

function expandNetlist(
  netlist: Netlist,
): readonly [
  deviceClass: DeviceClass,
  name: string,
  nodes: readonly string[],
  rawProps: RawDeviceProps,
][] {
  const counter = new Map<string, number>();
  return netlist.map(([idName, nodes, rawProps]) => {
    if (idName.indexOf("/") !== -1) {
      const [id, name] = idName.split("/", 2);
      return [getDeviceClass(id), name, nodes, rawProps];
    } else {
      const prefix = idName.toUpperCase();
      let index = counter.get(prefix) ?? 0;
      counter.set(prefix, (index += 1));
      const name = `${prefix}${index}`;
      return [getDeviceClass(idName), name, nodes, rawProps];
    }
  });
}
