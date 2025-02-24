import {
  type Branch,
  type DcParams,
  Device,
  type DeviceState,
  type Network,
  type Node,
  Props,
  type RealStamper,
} from "@jecs/simulator";

const enum S {
  V0,
  V,
  I,
  _Size_,
}

/**
 * Voltage source.
 */
export class Vdc extends Device.Dc {
  static override readonly id = "V";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = {
    V: Props.number({ title: "voltage" }),
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

  override reset(props: Props, state: DeviceState): void {
    state[S.V0] = props.getNumber("V");
  }

  override loadDc(state: DeviceState, { sourceFactor }: DcParams, stamper: RealStamper): void {
    const { np, nn, branch } = this;
    const V0 = state[S.V0];
    const V = sourceFactor * V0;
    state[S.V] = V;
    stamper.stampVoltageSource(np, nn, branch, V);
  }

  override saveDc(state: DeviceState, params: DcParams): void {
    const { branch } = this;
    state[S.I] = branch.current;
  }
}
