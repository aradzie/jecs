import { DcParams, Device, DeviceState, TrParams } from "../../circuit/device.js";
import { Stamper, stampVoltageSource } from "../../circuit/mna.js";
import type { Branch, Network, Node } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  V0,
  V,
  I,
  _Size_,
}

/**
 * Voltage source.
 */
export class Vdc extends Device {
  static override readonly id = "V";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {
    V: Properties.number({ title: "voltage" }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.I, name: "I", unit: "A" },
    ],
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

  override init(state: DeviceState): void {
    state[S.V0] = this.properties.getNumber("V");
  }

  override initDc(state: DeviceState, params: DcParams): void {}

  override loadDc(state: DeviceState, { sourceFactor }: DcParams, stamper: Stamper): void {
    const { np, nn, branch } = this;
    const V0 = state[S.V0];
    const V = sourceFactor * V0;
    state[S.V] = V;
    stampVoltageSource(stamper, np, nn, branch, V);
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
