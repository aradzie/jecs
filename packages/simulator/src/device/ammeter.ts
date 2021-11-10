import { Device, DeviceState, StateParams } from "../circuit/device";
import type { Branch, Network, Node, Stamper } from "../circuit/network";

const enum S {
  /** Current through probe. */
  I,
  _Size_,
}

/**
 * Ammeter.
 */
export class Ammeter extends Device {
  static override readonly id = "Ammeter";
  static override readonly numTerminals = 2;
  static override readonly paramsSchema = {};
  static override readonly stateParams: StateParams = {
    length: S._Size_,
    ops: [
      { index: S.I, name: "I", unit: "A" }, //
    ],
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
    this.branch = network.makeBranch(this.np, this.nn);
  }

  override eval(state: DeviceState, final: boolean): void {
    const { branch } = this;
    state[S.I] = branch.current;
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn, branch } = this;
    stamper.stampVoltageSource(np, nn, branch, 0);
  }
}
