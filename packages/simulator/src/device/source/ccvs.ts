import { type DcParams, Device, type DeviceState } from "../../circuit/device.js";
import { type RealStamper } from "../../circuit/mna.js";
import { type Branch, type Network, type Node } from "../../circuit/network.js";
import { Props } from "../../circuit/props.js";

const enum S {
  gain,
  V,
  I,
  _Size_,
}

/**
 * Current-controlled voltage source.
 */
export class CCVS extends Device.Dc {
  static override readonly id = "CCVS";
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
  private branch1!: Branch;
  /** Extra MNA branch. */
  private branch2!: Branch;

  override connect(network: Network, [np, nn, ncp, ncn]: readonly Node[]): void {
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
    this.branch1 = network.makeBranch(this.np, this.nn);
    this.branch2 = network.makeBranch(this.ncp, this.ncn);
  }

  override init(state: DeviceState): void {
    state[S.gain] = this.props.getNumber("gain");
  }

  override loadDc(state: DeviceState, params: DcParams, stamper: RealStamper): void {
    const { np, nn, branch1, ncp, ncn, branch2 } = this;
    const gain = state[S.gain];
    stamper.stampVoltageSource(np, nn, branch1, 0);
    stamper.stampVoltageSource(ncp, ncn, branch2, 0);
    stamper.stampA(branch1, branch2, -gain);
  }

  override endDc(state: DeviceState, params: DcParams): void {
    const { np, nn, branch1 } = this;
    const V = np.voltage - nn.voltage;
    const I = branch1.current;
    state[S.V] = V;
    state[S.I] = I;
  }
}
