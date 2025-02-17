import {
  type ComplexStamper,
  type DcParams,
  Device,
  type DeviceState,
  type Network,
  type Node,
  Props,
  type RealStamper,
} from "../../circuit/index.js";

const enum S {
  G,
  V,
  I,
  _Size_,
}

/**
 * Resistor.
 */
export class Resistor extends Device.Dc {
  static override readonly id = "R";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = {
    R: Props.number({
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
    const R = this.props.getNumber("R");
    state[S.G] = 1 / R;
  }

  override loadDc(state: DeviceState, params: DcParams, stamper: RealStamper): void {
    const { na, nb } = this;
    const G = state[S.G];
    stamper.stampConductance(na, nb, G);
  }

  override endDc(state: DeviceState, params: DcParams): void {
    const { na, nb } = this;
    const G = state[S.G];
    const V = na.voltage - nb.voltage;
    const I = V * G;
    state[S.V] = V;
    state[S.I] = I;
  }

  override loadAc(state: DeviceState, frequency: number, stamper: ComplexStamper): void {
    const { na, nb } = this;
    const G = state[S.G];
    stamper.stampConductance(na, nb, G, 0);
  }
}
