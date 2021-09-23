import type { Vector } from "../math/types";
import type { Device } from "./device";
import { CircuitError } from "./error";
import { Branch, Network, Node } from "./network";

export class Circuit implements Network {
  readonly groundNode: Node;
  readonly nodes: (Node | Branch)[] = [];
  readonly nodeNames = new Set<string>();
  readonly devices: Device[] = [];
  readonly deviceNames = new Set<string>();

  constructor() {
    this.groundNode = new Node(-1, "GROUND");
  }

  allocNode(name: string): Node {
    if (this.nodeNames.has(name)) {
      throw new CircuitError(`Duplicate node name [${name}]`);
    }
    this.nodeNames.add(name);
    const node = new Node(this.nodes.length, name);
    this.nodes.push(node);
    return node;
  }

  allocBranch(a: Node, b: Node): Branch {
    const branch = new Branch(this.nodes.length, a, b);
    this.nodes.push(branch);
    return branch;
  }

  addDevice(...devices: readonly Device[]): void {
    for (const device of devices) {
      const { name } = device;
      if (this.deviceNames.has(name)) {
        throw new CircuitError(`Duplicate device name [${name}]`);
      }
      this.deviceNames.add(device.name);
      this.devices.push(device);
      device.connect(this);
    }
  }

  updateDevices(x: Vector): void {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node instanceof Node) {
        node.voltage = x[i];
        continue;
      }
      if (node instanceof Branch) {
        node.current = x[i];
        continue;
      }
    }

    for (const device of this.devices) {
      device.update();
    }
  }
}
