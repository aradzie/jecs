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
  I,
  V,
  _Size_,
}

/**
 * Voltage-controlled current source.
 */
export class VCCS extends Device.Dc {
  static override readonly id = "VCCS";
  static override readonly numTerminals = 4;
  static override readonly propsSchema = {
    gain: Props.number({ title: "gain" }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.I, name: "I", unit: "A" },
      { index: S.V, name: "V", unit: "V" },
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
    stamper.stampA(np, branch, 1);
    stamper.stampA(nn, branch, -1);
    stamper.stampA(branch, ncp, gain);
    stamper.stampA(branch, ncn, -gain);
    stamper.stampA(branch, branch, -1);
  }

  override endDc(state: DeviceState, params: DcParams): void {
    const { np, nn, branch } = this;
    state[S.I] = branch.current;
    state[S.V] = np.voltage - nn.voltage;
  }
}
