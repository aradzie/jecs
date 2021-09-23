import type { Vector } from "../math/types";
import type { Device } from "./device";
import { CircuitError } from "./error";
import { Branch, Network, Node } from "./network";

export class Circuit implements Network {
  readonly #groundNode: Node;
  readonly #nodes: (Node | Branch)[] = [];
  readonly #nodesByName = new Map<string, Node>();
  readonly #devices: Device[] = [];
  readonly #devicesByName = new Map<string, Device>();

  constructor() {
    this.#groundNode = new Node(-1, "GROUND");
  }

  get groundNode(): Node {
    return this.#groundNode;
  }

  get nodes(): readonly (Node | Branch)[] {
    return this.#nodes;
  }

  get devices(): readonly Device[] {
    return this.#devices;
  }

  allocNode(name: string): Node {
    if (this.#nodesByName.has(name)) {
      throw new CircuitError(`Duplicate node name [${name}]`);
    }
    const node = new Node(this.#nodes.length, name);
    this.#nodesByName.set(node.name, node);
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
      const { name } = device;
      if (this.#devicesByName.has(name)) {
        throw new CircuitError(`Duplicate device name [${name}]`);
      }
      this.#devices.push(device);
      this.#devicesByName.set(device.name, device);
      device.connect(this);
    }
  }

  getNode(name: string): Node {
    const node = this.#nodesByName.get(name);
    if (node == null) {
      throw new CircuitError(`Unknown node [${name}]`);
    }
    return node;
  }

  getDevice(name: string): Device {
    const device = this.#devicesByName.get(name);
    if (device == null) {
      throw new CircuitError(`Unknown device [${name}]`);
    }
    return device;
  }

  updateDevices(x: Vector): void {
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

    for (const device of this.#devices) {
      device.update();
    }
  }
}
