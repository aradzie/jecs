import type { Vector } from "@jssim/math/lib/types";
import type { Device } from "./device.js";
import { CircuitError } from "./error.js";
import { Branch, groundNode, Network, Node } from "./network.js";
import { Properties, Temp } from "./properties.js";

export class Circuit implements Network {
  readonly options = new Properties({
    Temp: Properties.number({
      default: Temp,
      min: -273.15, // Absolute zero.
      title: "simulation temperature in degrees Celsius",
    }),
    abstol: Properties.number({
      default: 1e-12, // 1pA
      min: 0,
      title: "absolute current error tolerance in amperes",
    }),
    vntol: Properties.number({
      default: 1e-6, // 1uV
      min: 0,
      title: "absolute voltage error tolerance in volts",
    }),
    reltol: Properties.number({
      default: 1e-3,
      min: 0,
      title: "Relative error tolerance",
    }),
    gmin: Properties.number({
      default: 1e-12,
      min: 0,
      title: "minimum conductance in siemens",
    }),
    integrationMethod: Properties.enum({
      values: ["trapezoidal", "euler"],
      title: "integration method",
    }),
  });
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

  reset(): void {
    for (const node of this.#nodes) {
      switch (node.type) {
        case "node":
          node.voltage = 0;
          break;
        case "branch":
          node.current = 0;
          break;
      }
    }
    for (const device of this.#devices) {
      device.state.fill(0);
      device.deriveState(device.state);
    }
  }

  makeNode(id: string): Node {
    if (this.#nodesById.has(id)) {
      throw new CircuitError(`Duplicate node [${id}]`);
    }
    const node = new Node(this.#nodes.length, id);
    this.#nodesById.set(node.id, node);
    this.#nodes.push(node);
    return node;
  }

  makeBranch(a: Node, b: Node): Branch {
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
      switch (node.type) {
        case "node":
          node.voltage = x[i];
          break;
        case "branch":
          node.current = x[i];
          break;
      }
    }
  }
}
