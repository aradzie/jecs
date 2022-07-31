import { DcParams, Device, DeviceState, TrParams } from "../../circuit/device.js";
import { Stamper, stampVoltageSource } from "../../circuit/mna.js";
import type { Branch, Network, Node } from "../../circuit/network.js";

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
  static override readonly propertiesSchema = {};
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

  override initDc(state: DeviceState, params: DcParams): void {}

  override loadDc(state: DeviceState, params: DcParams, stamper: Stamper): void {
    const { np, nn, branch } = this;
    stampVoltageSource(stamper, np, nn, branch, 0);
  }

  override endDc(state: DeviceState, params: DcParams): void {
    const { branch } = this;
    const I = branch.current;
    state[S.I] = I;
  }

  override initTr(state: DeviceState, params: TrParams): void {
    this.initDc(state, params);
  }

  override loadTr(state: DeviceState, params: TrParams, stamper: Stamper): void {
    this.loadDc(state, params, stamper);
  }

  override endTr(state: DeviceState, params: TrParams): void {
    this.endDc(state, params);
  }
}
