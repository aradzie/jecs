import { solve } from "../math/gauss-elimination";
import { matMakeEmpty } from "../math/matrix";
import type { Vector } from "../math/types";
import type { Device } from "./device/device";
import { Branch, Network, Node, Stamper } from "./network";

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
      throw new TypeError(`Duplicate node name [${name}]`);
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
        throw new TypeError(`Duplicate device name [${name}]`);
      }
      this.deviceNames.add(device.name);
      this.devices.push(device);
      device.connect(this);
    }
  }

  dc(): Map<string, number> {
    if (this.devices.length === 0) {
      throw new TypeError(`Empty circuit`);
    }

    const n = this.nodes.length;
    const matrix = matMakeEmpty(n, n);
    const rhs = new Float64Array(n);
    const { groundNode } = this;

    const stamper = new (class implements Stamper {
      stampMatrix(i: Node | Branch, j: Node | Branch, x: number): void {
        if (Number.isNaN(x) || !Number.isFinite(x)) {
          throw new TypeError();
        }
        if (i !== groundNode && j !== groundNode) {
          matrix[i.index][j.index] += x;
        }
      }

      stampRightSide(i: Node | Branch, x: number): void {
        if (Number.isNaN(x) || !Number.isFinite(x)) {
          throw new TypeError();
        }
        if (i !== groundNode) {
          rhs[i.index] += x;
        }
      }
    })();

    for (const device of this.devices.values()) {
      device.stamp(stamper);
    }

    const x = solve(matrix, rhs);

    this.updateDevices(x);

    const result = new Map<string, number>();
    result.set(`V[${groundNode.name}]`, 0);
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node instanceof Node) {
        result.set(`V[${node.name}]`, node.voltage);
        continue;
      }
      if (node instanceof Branch) {
        result.set(`I[${node.a.name}->${node.b.name}]`, node.current);
        continue;
      }
    }
    return result;
  }

  private updateDevices(x: Vector): void {
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

    for (const device of this.devices.values()) {
      device.update();
    }
  }
}
