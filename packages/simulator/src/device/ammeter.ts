import { Device, StateParams } from "../circuit/device";
import type { Branch, Network, Node, Stamper } from "../circuit/network";
import type { Op } from "../circuit/ops";
import { Unit } from "../util/unit";

/**
 * Ammeter.
 */
export class Ammeter extends Device {
  static override readonly id = "Ammeter";
  static override readonly numTerminals = 2;
  static override readonly paramsSchema = {};
  static override readonly stateParams: StateParams = {
    length: 0,
    outputs: [],
  };

  /** Positive terminal. */
  readonly np: Node;
  /** Negative terminal. */
  readonly nn: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  constructor(id: string, [np, nn]: readonly Node[]) {
    super(id, [np, nn], {});
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

  override ops(): readonly Op[] {
    const { branch } = this;
    const I = branch.current;
    return [
      { name: "I", value: I, unit: Unit.AMPERE }, //
    ];
  }
}
