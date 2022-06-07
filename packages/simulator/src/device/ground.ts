import { Device } from "../circuit/device.js";
import { CircuitError } from "../circuit/error.js";
import type { Network, Node } from "../circuit/network.js";

export class Ground extends Device {
  static override readonly id = "Ground";
  static override readonly numTerminals = 1;
  static override readonly propertiesSchema = {};
  static override readonly stateSchema = {
    length: 0,
    ops: [],
  };

  readonly n: Node;

  constructor(id: string, [n]: readonly Node[]) {
    super(id, [n]);
    this.n = n;
  }

  override connect(network: Network): void {
    if (this.n !== network.groundNode) {
      throw new CircuitError(`The ground device must be connected to the ground node.`);
    }
  }
}
