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
  gain,
  V,
  I,
  _Size_,
}

/**
 * Voltage-controlled voltage source.
 */
export class VCVS extends Device.Dc {
  static override readonly id = "VCVS";
  static override readonly numTerminals = 4;
  static override readonly propsSchema = {
    gain: Props.number({ title: "gain" }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.I, name: "I", unit: "A" },
    ],
  };

  /** Positive output terminal. */
  private np!: Node;
  /** Negative output terminal. */
  private nn!: Node;
  /** Positive control terminal. */
  private ncp!: Node;
  /** Negative control terminal. */
  private ncn!: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  override connect(network: Network, [np, nn, ncp, ncn]: readonly Node[]): void {
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
    this.branch = network.makeBranch(this.np, this.nn);
  }

  override reset(props: Props, state: DeviceState): void {
    state[S.gain] = props.getNumber("gain");
  }

  override loadDc(state: DeviceState, params: DcParams, stamper: RealStamper): void {
    const { np, nn, ncp, ncn, branch } = this;
    const gain = state[S.gain];
    stamper.stampVoltageSource(np, nn, branch, 0);
    stamper.stampA(branch, ncp, -gain);
    stamper.stampA(branch, ncn, gain);
  }

  override saveDc(state: DeviceState, params: DcParams): void {
    const { np, nn, branch } = this;
    state[S.V] = np.voltage - nn.voltage;
    state[S.I] = branch.current;
  }
}
