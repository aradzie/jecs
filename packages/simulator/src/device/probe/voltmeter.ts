import { DcParams, Device, DeviceState } from "../../circuit/device.js";
import type { Network, Node } from "../../circuit/network.js";

const enum S {
  /** Voltage through probe. */
  V,
  _Size_,
}

/**
 * Voltmeter.
 */
export class Voltmeter extends Device.Dc {
  static override readonly id = "Voltmeter";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = {};
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

  override endDc(state: DeviceState, params: DcParams): void {
    const { np, nn } = this;
    state[S.V] = np.voltage - nn.voltage;
  }
}
