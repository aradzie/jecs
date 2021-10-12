import type { Details } from "../circuit/details";
import { Device } from "../circuit/device";
import type { Branch, Network, Node, Stamper } from "../circuit/network";
import { Unit } from "../util/unit";

/**
 * Ammeter.
 */
export class Ammeter extends Device {
  static override readonly id = "Ammeter";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = {};

  /** Positive terminal. */
  readonly np: Node;
  /** Negative terminal. */
  readonly nn: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  constructor(name: string, [np, nn]: readonly Node[]) {
    super(name, [np, nn], {});
    this.np = np;
    this.nn = nn;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.np, this.nn);
  }

  override stamp(stamper: Stamper): void {
    const { np, nn, branch } = this;
    stamper.stampVoltageSource(np, nn, branch, 0);
  }

  override details(): Details {
    const { branch } = this;
    const current = branch.current;
    return [
      { name: "I", value: current, unit: Unit.AMPERE }, //
    ];
  }
}
