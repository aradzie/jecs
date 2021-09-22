import { Circuit } from "./circuit";
import { devices } from "./device";
import type { Device, DeviceClass, DeviceProps } from "./device/device";
import { Ground } from "./device/ground";
import { CircuitError } from "./error";
import type { Node } from "./network";

export type NetList = readonly NetListItem[];

export type NetListItem = readonly [
  id: string,
  connections: readonly string[],
  props: DeviceProps & {
    readonly [name: string]: unknown;
  },
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
  props: unknown,
): Device {
  if (id === "g") {
    return new Ground(nodes);
  }
  const deviceInfo = deviceMap.get(id) ?? null;
  if (deviceInfo == null) {
    throw new CircuitError(`Unknown device id [${id}]`);
  }
  const { deviceClass, numTerminals } = deviceInfo;
  if (nodes.length !== numTerminals) {
    throw new CircuitError(`Invalid number of terminals ${nodes.length}`);
  }
  return new deviceClass(nodes, props);
}

export function readNetList(netlist: NetList): Circuit {
  const circuit = new Circuit();
  const nodeMap = new Map<string, Node>();
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
