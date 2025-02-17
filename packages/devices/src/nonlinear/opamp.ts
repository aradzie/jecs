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
import { gMin, piOverTwo, twoOverPi } from "../const.js";

const enum S {
  gain,
  Vmax,
  Vin,
  Vout,
  gv,
  _Size_,
}

/**
 * Ideal operational amplifier.
 */
export class OpAmp extends Device.Dc {
  static override readonly id = "OpAmp";
  static override readonly numTerminals = 3;
  static override readonly propsSchema = {
    gain: Props.number({
      defaultValue: 1e6,
      range: ["real", ">", 0],
      title: "gain",
    }),
    Vmax: Props.number({
      defaultValue: 15,
      range: ["real", ">", 0],
      title: "maximum absolute value of output voltage",
    }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.Vin, name: "Vin", unit: "V" },
      { index: S.Vout, name: "Vout", unit: "V" },
    ],
  };
  static override readonly linear = false;

  /** Positive input terminal. */
  private np!: Node;
  /** Negative input terminal. */
  private nn!: Node;
  /** Output terminal. */
  private no!: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  override connect(network: Network, [np, nn, no]: readonly Node[]): void {
    this.np = np;
    this.nn = nn;
    this.no = no;
    this.branch = network.makeBranch(this.no, network.groundNode);
  }

  override init(state: DeviceState): void {
    const gain = this.props.getNumber("gain");
    const Vmax = this.props.getNumber("Vmax");
    state[S.gain] = gain;
    state[S.Vmax] = Vmax;
  }

  override loadDc(state: DeviceState, params: DcParams, stamper: RealStamper): void {
    const { np, nn, no, branch } = this;
    const gain = state[S.gain];
    const Vmax = state[S.Vmax];
    const Vin = np.voltage - nn.voltage;
    const c = (piOverTwo * gain * Vin) / Vmax;
    const Vout = Vmax * twoOverPi * Math.atan(c);
    const gv = gain / (1 + c * c) + gMin;
    state[S.Vin] = Vin;
    state[S.Vout] = Vout;
    state[S.gv] = gv;
    stamper.stampA(no, branch, 1);
    stamper.stampA(branch, np, gv);
    stamper.stampA(branch, nn, -gv);
    stamper.stampA(branch, no, -1);
    stamper.stampB(branch, gv * Vin - Vout);
  }
}
