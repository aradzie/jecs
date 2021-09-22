import { CircuitError } from "../error";
import type { Network, Node } from "../network";
import { Device, DeviceProps } from "./device";

export class Ground extends Device {
  static override readonly id = "g";
  static override readonly numTerminals = 1;
  static override readonly propsSchema = [];

  readonly n: Node;

  constructor(
    [n]: readonly Node[],
    { name }: DeviceProps = { name: "GROUND" },
  ) {
    super([n], name);
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
