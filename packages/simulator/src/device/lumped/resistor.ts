import { DcParams, Device, DeviceState, TrParams } from "../../circuit/device.js";
import { AcStamper, stampConductance, stampConductanceAc, Stamper } from "../../circuit/mna.js";
import type { Network, Node } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  G,
  V,
  I,
  _Size_,
}

/**
 * Resistor.
 */
export class Resistor extends Device {
  static override readonly id = "R";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {
    R: Properties.number({
      title: "resistance",
      range: ["real", "<>", 0],
    }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.I, name: "I", unit: "A" },
    ],
  };

  /** First terminal. */
  private na!: Node;
  /** Second terminal. */
  private nb!: Node;

  override connect(network: Network, [na, nb]: readonly Node[]): void {
    this.na = na;
    this.nb = nb;
  }

  override init(state: DeviceState): void {
    const R = this.properties.getNumber("R");
    state[S.G] = 1 / R;
  }

  override initDc(state: DeviceState, params: DcParams): void {}

  override loadDc(state: DeviceState, params: DcParams, stamper: Stamper): void {
    const { na, nb } = this;
    const G = state[S.G];
    stampConductance(stamper, na, nb, G);
  }

  override endDc(state: DeviceState, params: DcParams): void {
    const { na, nb } = this;
    const G = state[S.G];
    const V = na.voltage - nb.voltage;
    const I = V * G;
    state[S.V] = V;
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

  override loadAc(state: DeviceState, frequency: number, stamper: AcStamper): void {
    const { na, nb } = this;
    const G = state[S.G];
    stampConductanceAc(stamper, na, nb, G, 0);
  }
}
