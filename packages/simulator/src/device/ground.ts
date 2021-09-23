import { Device } from "../simulation/device";
import { CircuitError } from "../simulation/error";
import type { Network, Node } from "../simulation/network";

export class Ground extends Device {
  static override readonly id = "g";
  static override readonly numTerminals = 1;
  static override readonly propsSchema = [];

  readonly n: Node;

  constructor(name: string, [n]: readonly Node[]) {
    super(name, [n]);
    this.n = n;
  }

  override connect(network: Network): void {
    if (this.n !== network.groundNode) {
      throw new CircuitError(
        `The ground device must be connected to the ground node.`,
      );
    }
  }
}