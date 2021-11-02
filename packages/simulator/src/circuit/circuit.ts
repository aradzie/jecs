import type { Vector } from "../math/types";
import type { Device } from "./device";
import { CircuitError } from "./error";
import { Branch, groundNode, Network, Node } from "./network";

export class Circuit implements Network {
  readonly #nodes: (Node | Branch)[] = [];
  readonly #nodesById = new Map<string, Node>();
  readonly #devices: Device[] = [];
  readonly #devicesById = new Map<string, Device>();

  get groundNode(): Node {
    return groundNode;
  }

  get nodes(): readonly (Node | Branch)[] {
    return this.#nodes;
  }

  get devices(): readonly Device[] {
    return this.#devices;
  }

  allocNode(id: string): Node {
    if (this.#nodesById.has(id)) {
      throw new CircuitError(`Duplicate node [${id}]`);
    }
    const node = new Node(this.#nodes.length, id);
    this.#nodesById.set(node.id, node);
    this.#nodes.push(node);
    return node;
  }

  allocBranch(a: Node, b: Node): Branch {
    const branch = new Branch(this.#nodes.length, a, b);
    this.#nodes.push(branch);
    return branch;
  }

  addDevice(...devices: readonly Device[]): void {
    for (const device of devices) {
      const { id } = device;
      if (this.#devicesById.has(id)) {
        throw new CircuitError(`Duplicate device instance [${id}]`);
      }
      this.#devices.push(device);
      this.#devicesById.set(device.id, device);
      device.connect(this);
    }
  }

  getNode(id: string): Node {
    const node = this.#nodesById.get(id);
    if (node == null) {
      throw new CircuitError(`Unknown node [${id}]`);
    }
    return node;
  }

  getDevice(id: string): Device {
    const device = this.#devicesById.get(id);
    if (device == null) {
      throw new CircuitError(`Unknown device instance [${id}]`);
    }
    return device;
  }

  updateNodes(x: Vector): void {
    for (let i = 0; i < this.#nodes.length; i++) {
      const node = this.#nodes[i];
      if (node instanceof Node) {
        node.voltage = x[i];
        continue;
      }
      if (node instanceof Branch) {
        node.current = x[i];
        continue;
      }
    }
  }
}
