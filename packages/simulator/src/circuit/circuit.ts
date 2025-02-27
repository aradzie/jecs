import { Props, type PropsSchema } from "../props/index.js";
import { type Device } from "./device.js";
import { Bindings, ConstantExp, Equations } from "./equations.js";
import { CircuitError } from "./error.js";
import { Branch, groundNode, type Network, Node } from "./network.js";
import { type ComplexStamper, type RealStamper } from "./stamp.js";

export class Circuit implements Network {
  static readonly propsSchema: PropsSchema = {
    temp: Props.number({
      defaultValue: 26.85, // Room temperature.
      range: ["real", ">", -273.15], // Absolute zero.
      title: "default device temperature in degrees Celsius",
    }),
  };

  readonly #nodes: (Node | Branch)[] = [];
  readonly #nodesById = new Map<string, Node>();
  readonly #devices: Device[] = [];
  readonly #devicesById = new Map<string, Device>();
  readonly #equations = new Equations();
  readonly #bindings = new Bindings(this.#equations);

  temp: number;
  time: number;
  frequency: number;
  sourceFactor: number;

  constructor() {
    this.temp = 0;
    this.time = 0;
    this.frequency = 0;
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

  makeNode(id: string): Node {
    if (this.#nodesById.has(id)) {
      throw new CircuitError(`Duplicate node [${id}]`);
    }
    const node = new Node(id);
    this.#nodesById.set(node.id, node);
    this.#nodes.push(node);
    return node;
  }

  makeBranch(a: Node, b: Node): Branch {
    const branch = new Branch(a, b);
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

  init(analysis: "dc" | "ac"): void {
    for (const device of this.#devices) {
      device.state.fill(0);
      device.init(device.props, device.state, analysis);
    }
  }

  reset(): void {
    this.#equations.set("temp", new ConstantExp(this.temp));
    this.#equations.set("time", new ConstantExp(this.time));
    this.#equations.set("frequency", new ConstantExp(this.frequency));
    this.#bindings.setProps();
    for (const node of this.#nodes) {
      switch (node.type) {
        case "node":
          node.voltage = 0;
          node.phase = 0;
          break;
        case "branch":
          node.current = 0;
          node.phase = 0;
          break;
      }
    }
    for (const device of this.#devices) {
      device.state.fill(0);
      device.reset(device.props, device.state);
    }
  }

  loadDc(stamper: RealStamper): void {
    for (const device of this.#devices) {
      device.loadDc(device.state, this, stamper);
    }
  }

  saveDc(): void {
    for (const device of this.#devices) {
      device.saveDc(device.state, this);
    }
  }

  loadTr(stamper: RealStamper): void {
    for (const device of this.#devices) {
      device.loadTr(device.state, this, stamper);
    }
  }

  saveTr(): void {
    for (const device of this.#devices) {
      device.saveTr(device.state, this);
    }
  }

  loadAc(stamper: ComplexStamper): void {
    for (const device of this.#devices) {
      device.loadAc(device.state, this.frequency, stamper);
    }
  }

  reindexNodes(): (Node | Branch)[] {
    let list: (Node | Branch)[] = [];
    for (const node of this.#nodes) {
      if (node.enabled && node !== groundNode) {
        node.index = list.length;
        list.push(node);
      } else {
        node.index = -1;
      }
    }
    return list;
  }
}
