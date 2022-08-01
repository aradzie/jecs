import {
  CircuitError,
  Device,
  type DeviceClass,
  type Network,
  type Node,
  type PropValue,
} from "@jecs/simulator";

export type DeviceSpec = {
  readonly deviceClass: DeviceClass;
  readonly id: string;
  readonly nodes: readonly string[];
  readonly props: Record<string, PropValue>;
};

export class SubCircuit extends Device {
  static override readonly id = "Sub";
  static override readonly numTerminals = 0;
  static override readonly propsSchema = {};
  static override readonly stateSchema = {
    length: 0,
    ops: [],
  };

  readonly #ports: string[] = [];
  readonly #devices: DeviceSpec[] = [];

  addPorts(ports: readonly string[]): void {
    this.#ports.push(...ports);
  }

  addDevices(devices: readonly DeviceSpec[]): void {
    this.#devices.push(...devices);
  }

  override connect(network: Network, nodes: readonly Node[]): void {
    const nodeMap = new Map<string, Node>();
    this.#makeNodes(network, this.#ports, nodeMap, false);
    for (const spec of this.#devices) {
      if (spec.deviceClass.numTerminals !== spec.nodes.length) {
        throw new CircuitError(`Wrong number of nodes`);
      }
      this.#addDevice(network, spec, nodeMap);
    }
  }

  #addDevice(network: Network, spec: DeviceSpec, nodeMap: Map<string, Node>): void {
    const instance = new spec.deviceClass(this.#scopedId(spec.id));
    for (const [name, value] of Object.entries(spec.props)) {
      instance.props.set(name, value);
    }
    instance.connect(network, this.#makeNodes(network, spec.nodes, nodeMap, true));
  }

  #makeNodes(
    network: Network,
    nodeList: readonly string[],
    nodeMap: Map<string, Node>,
    internal: boolean,
  ): Node[] {
    const nodes: Node[] = [];
    for (const id of nodeList) {
      const scopedId = this.#scopedId(id);
      let node = nodeMap.get(scopedId);
      if (node == null) {
        nodeMap.set(scopedId, (node = network.makeNode(scopedId, internal)));
      }
      nodes.push(node);
    }
    return nodes;
  }

  #scopedId(id: string): string {
    return `[${this.id}:${id}]`;
  }
}
