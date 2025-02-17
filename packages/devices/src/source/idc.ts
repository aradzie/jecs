import {
  type DcParams,
  Device,
  type DeviceState,
  type Network,
  type Node,
  Props,
  type RealStamper,
} from "@jecs/simulator";

const enum S {
  I0,
  I,
  V,
  _Size_,
}

/**
 * Current source.
 */
export class Idc extends Device.Dc {
  static override readonly id = "I";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = {
    I: Props.number({ title: "current" }),
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
    state[S.I0] = this.props.getNumber("I");
  }

  override loadDc(state: DeviceState, { sourceFactor }: DcParams, stamper: RealStamper): void {
    const { np, nn } = this;
    const I0 = state[S.I0];
    const I = sourceFactor * I0;
    state[S.I] = I;
    stamper.stampCurrentSource(np, nn, I);
  }

  override endDc(state: DeviceState, params: DcParams): void {
    const { np, nn } = this;
    state[S.V] = np.voltage - nn.voltage;
  }
}
