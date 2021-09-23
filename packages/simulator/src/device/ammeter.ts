import type { Details } from "../simulation/details";
import { Device } from "../simulation/device";
import type { Branch, Network, Node, Stamper } from "../simulation/network";
import { Unit } from "../util/unit";

/**
 * Ammeter.
 */
export class Ammeter extends Device {
  static override readonly id = "ammeter";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = [];

  /** Negative terminal. */
  readonly nn: Node;
  /** Positive terminal. */
  readonly np: Node;
  /** Extra MNA branch. */
  branch!: Branch;

  constructor(
    name: string, //
    [nn, np]: readonly Node[],
  ) {
    super(name, [nn, np]);
    this.nn = nn;
    this.np = np;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.np, this.nn);
  }

  override stamp(stamper: Stamper): void {
    const { nn, np, branch } = this;
    stamper.stampMatrix(nn, branch, -1);
    stamper.stampMatrix(np, branch, 1);
    stamper.stampMatrix(branch, nn, -1);
    stamper.stampMatrix(branch, np, 1);
  }

  override details(): Details {
    return [
      { name: "I", value: this.branch.current, unit: Unit.AMPERE }, //
    ];
  }
}
