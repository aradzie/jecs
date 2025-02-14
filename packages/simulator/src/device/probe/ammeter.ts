import { DcParams, Device, DeviceState } from "../../circuit/device.js";
import type { RealStamper } from "../../circuit/mna.js";
import type { Branch, Network, Node } from "../../circuit/network.js";

const enum S {
  /** Current through probe. */
  I,
  _Size_,
}

/**
 * Ammeter.
 */
export class Ammeter extends Device.Dc {
  static override readonly id = "Ammeter";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = {};
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [{ index: S.I, name: "I", unit: "A" }],
  };

  /** Positive terminal. */
  private np!: Node;
  /** Negative terminal. */
  private nn!: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  override connect(network: Network, [np, nn]: readonly Node[]): void {
    this.np = np;
    this.nn = nn;
    this.branch = network.makeBranch(this.np, this.nn);
  }

  override loadDc(state: DeviceState, params: DcParams, stamper: RealStamper): void {
    const { np, nn, branch } = this;
    stamper.stampVoltageSource(np, nn, branch, 0);
  }

  override endDc(state: DeviceState, params: DcParams): void {
    const { branch } = this;
    state[S.I] = branch.current;
  }
}
