import { DcParams, Device, DeviceState, TrParams } from "../../circuit/device.js";
import type { Stamper } from "../../circuit/mna.js";
import type { Network, Node } from "../../circuit/network.js";

const enum S {
  /** Voltage through probe. */
  V,
  _Size_,
}

/**
 * Voltmeter.
 */
export class Voltmeter extends Device {
  static override readonly id = "Voltmeter";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {};
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [{ index: S.V, name: "V", unit: "V" }],
  };

  /** Positive terminal. */
  private np!: Node;
  /** Negative terminal. */
  private nn!: Node;

  override connect(network: Network, [np, nn]: readonly Node[]): void {
    this.np = np;
    this.nn = nn;
  }

  override initDc(state: DeviceState, params: DcParams): void {}

  override loadDc(state: DeviceState, params: DcParams, stamper: Stamper): void {}

  override endDc(state: DeviceState, params: DcParams): void {
    const { np, nn } = this;
    const V = np.voltage - nn.voltage;
    state[S.V] = V;
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
