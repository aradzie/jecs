import type { Device } from "./device.js";
import { Bindings, ConstantExp, Equations } from "./equations.js";
import { CircuitError } from "./error.js";
import type { Stamper } from "./mna.js";
import { Branch, groundNode, Network, Node } from "./network.js";

export class Circuit implements Network {
  readonly #nodes: (Node | Branch)[] = [];
  readonly #nodesById = new Map<string, Node>();
  readonly #devices: Device[] = [];
  readonly #devicesById = new Map<string, Device>();
  readonly #equations = new Equations();
  readonly #bindings = new Bindings(this.#equations);

  elapsedTime: number;
  timeStep: number;
  temp: number;
  sourceFactor: number;

  constructor() {
    this.elapsedTime = 0;
    this.timeStep = NaN;
    this.temp = 0;
    this.sourceFactor = 1;
  }

  get groundNode(): Node {
    return groundNode;
  }

  get nodes(): readonly (Node | Branch)[] {
    return this.#nodes;
  }

  get devices(): readonly Device[] {
    return this.#devices;
  }

  get equations(): Equations {
    return this.#equations;
  }

  get bindings(): Bindings {
    return this.#bindings;
  }

  reset(): void {
    this.#equations.set("time", new ConstantExp(this.elapsedTime));
    this.#equations.set("temp", new ConstantExp(this.temp));
    this.#bindings.setProperties();
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
      device.deriveState(device.state, this);
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

  connect(device: Device, nodes: readonly Node[]): void {
    const { id } = device;
    if (this.#devicesById.has(id)) {
      throw new CircuitError(`Duplicate device instance [${id}]`);
    }
    this.#devices.push(device);
    this.#devicesById.set(device.id, device);
    device.connect(this, nodes);
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

  beginEval(): void {
    for (const device of this.#devices) {
      device.beginEval(device.state, this);
    }
  }

  eval(stamper: Stamper): void {
    for (const device of this.#devices) {
      device.eval(device.state, this, stamper);
    }
  }

  endEval(): void {
    for (const device of this.#devices) {
      device.endEval(device.state, this);
    }
  }
}
