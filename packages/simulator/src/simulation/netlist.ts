import { Circuit } from "./circuit";
import { devices } from "./device";
import type { Device, DeviceClass, RawDeviceProps } from "./device/device";
import { validateDeviceProps } from "./device/device";
import { Ground } from "./device/ground";
import { VSource } from "./device/vsource";
import { CircuitError } from "./error";
import type { Node } from "./network";

export type Netlist = readonly NetlistItem[];

export type NetlistItem = readonly [
  id: string,
  connections: readonly string[],
  rawProps: RawDeviceProps,
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
  rawProps: RawDeviceProps,
): Device {
  const deviceClass = deviceMap.get(id) ?? null;
  if (deviceClass == null) {
    throw new CircuitError(`Unknown device id [${id}]`);
  }
  const { name } = rawProps;
  if (typeof name !== "string") {
    throw new CircuitError(`The [name] property is missing`);
  }
  const { numTerminals, propsSchema } = deviceClass;
  if (nodes.length !== numTerminals) {
    throw new CircuitError(
      `Netlist error in device [${id}:${name}]: ` +
        `Invalid number of terminals`,
    );
  }
  let props;
  try {
    props = validateDeviceProps(rawProps, propsSchema);
  } catch (err) {
    throw new CircuitError(
      `Netlist error in device [${id}:${name}]: ` + err.message,
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

registerDevice(...devices);
