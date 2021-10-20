import type { Op } from "../circuit/ops";
import { Device } from "../circuit/device";
import { CircuitError } from "../circuit/error";
import type { Network, Node } from "../circuit/network";
import { Unit } from "../util/unit";

export class Ground extends Device {
  static override readonly id = "Ground";
  static override readonly numTerminals = 1;
  static override readonly paramsSchema = {};

  readonly n: Node;

  constructor(name: string, [n]: readonly Node[]) {
    super(name, [n], {});
    this.n = n;
  }

  override connect(network: Network): void {
    if (this.n !== network.groundNode) {
      throw new CircuitError(
        `The ground device must be connected to the ground node.`,
      );
    }
  }

  override ops(): readonly Op[] {
    return [
      { name: "V", value: this.n.voltage, unit: Unit.VOLT }, //
    ];
  }
}
