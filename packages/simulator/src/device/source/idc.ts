import { DcParams, Device, DeviceState, TrParams } from "../../circuit/device.js";
import { stampCurrentSource, Stamper } from "../../circuit/mna.js";
import type { Network, Node } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  I0,
  I,
  V,
  _Size_,
}

/**
 * Current source.
 */
export class Idc extends Device {
  static override readonly id = "I";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {
    I: Properties.number({ title: "current" }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.I, name: "I", unit: "A" },
      { index: S.V, name: "V", unit: "V" },
    ],
  };

  /** Positive terminal. */
  private np!: Node;
  /** Negative terminal. */
  private nn!: Node;

  override connect(network: Network, [np, nn]: readonly Node[]): void {
    this.np = np;
    this.nn = nn;
  }

  override init(state: DeviceState): void {
    state[S.I0] = this.properties.getNumber("I");
  }

  override initDc(state: DeviceState, params: DcParams): void {}

  override loadDc(state: DeviceState, { sourceFactor }: DcParams, stamper: Stamper): void {
    const { np, nn } = this;
    const I0 = state[S.I0];
    const I = sourceFactor * I0;
    state[S.I] = I;
    stampCurrentSource(stamper, np, nn, I);
  }

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
