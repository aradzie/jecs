import { Circuit } from "./circuit";
import { devices } from "./device";
import type { AnyDeviceProps, Device, DeviceClass } from "./device/device";
import { Ground } from "./device/ground";
import { VSource } from "./device/vsource";
import { CircuitError } from "./error";
import type { Node } from "./network";

export type Netlist = readonly NetlistItem[];

export type NetlistItem = readonly [
  id: string,
  connections: readonly string[],
  props: AnyDeviceProps,
];

const deviceMap = new Map<string, DeviceClass>();

export function registerDevice(...deviceClasses: DeviceClass[]) {
  for (const deviceClass of deviceClasses) {
    const { id, numTerminals, propsSchema } = deviceClass;
    if (id == null) {
      throw new CircuitError(
        `The [id] attribute is missing` + //
          ` in device class [${deviceClass}]`,
      );
    }
    if (numTerminals == null) {
      throw new CircuitError(
        `The [numTerminals] attribute is missing in` + //
          ` device class [${deviceClass}]`,
      );
    }
    if (propsSchema == null) {
      throw new CircuitError(
        `The [propsSchema] attribute is missing` + //
          ` in device class [${deviceClass}]`,
      );
    }
    if (deviceMap.has(id)) {
      throw new CircuitError(`Duplicate device id [${id}]`);
    }
    deviceMap.set(id, deviceClass);
  }
}

export function createDevice(
  id: string,
  nodes: readonly Node[],
  props: AnyDeviceProps,
): Device {
  if (id === Ground.id) {
    return new Ground(nodes);
  }
  const deviceClass = deviceMap.get(id) ?? null;
  if (deviceClass == null) {
    throw new CircuitError(`Unknown device id [${id}]`);
  }
  const { numTerminals } = deviceClass;
  if (nodes.length !== numTerminals) {
    throw new CircuitError(
      `Invalid number of terminals ${nodes.length} ` +
        `for device [${id}:${props.name}]`,
    );
  }
  return new deviceClass(nodes, props);
}

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
  for (const [id, connections, props] of netlist) {
    const nodes = connections.map((name) => {
      let node = nodeMap.get(name) ?? null;
      if (node == null) {
        nodeMap.set(name, (node = circuit.allocNode(name)));
      }
      return node;
    });
    circuit.addDevice(createDevice(id, nodes, props));
  }

  return circuit;
}

registerDevice(...devices);
