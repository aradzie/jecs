import { Circuit } from "./circuit";
import { devices } from "./device";
import type { Device, DeviceClass, DeviceProps } from "./device/device";
import { Ground } from "./device/ground";
import { VSource } from "./device/vsource";
import { CircuitError } from "./error";
import type { Node } from "./network";

export type NetList = readonly NetListItem[];

type AnyDeviceProps = DeviceProps & {
  readonly [name: string]: unknown;
};

export type NetListItem = readonly [
  id: string,
  connections: readonly string[],
  props: AnyDeviceProps,
];

const deviceMap = new Map<
  string,
  {
    readonly deviceClass: { new (...args: any[]): Device };
    readonly numTerminals: number;
  }
>();

export function registerDevice(...deviceClasses: DeviceClass[]) {
  for (const deviceClass of deviceClasses) {
    const { id, numTerminals } = deviceClass;
    if (id == null) {
      throw new CircuitError(`The [id] attribute is missing`);
    }
    if (numTerminals == null) {
      throw new CircuitError(`The [numTerminals] attribute is missing`);
    }
    if (deviceMap.has(id)) {
      throw new CircuitError(`Duplicate device id [${id}]`);
    }
    deviceMap.set(id, { deviceClass, numTerminals });
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
  const deviceInfo = deviceMap.get(id) ?? null;
  if (deviceInfo == null) {
    throw new CircuitError(`Unknown device id [${id}]`);
  }
  const { deviceClass, numTerminals } = deviceInfo;
  if (nodes.length !== numTerminals) {
    throw new CircuitError(
      `Invalid number of terminals ${nodes.length} ` +
        `for device [${id}:${props.name}]`,
    );
  }
  return new deviceClass(nodes, props);
}

export function readNetList(netlist: NetList): Circuit {
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
