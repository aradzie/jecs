import { Device, DeviceState, EvalOptions, StateParams } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import { Params } from "../../circuit/params";
import { piOverTwo, twoOverPi } from "../const";

export interface OpAmpParams {
  readonly gain: number;
  readonly Vmax: number;
}

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
export class OpAmp extends Device<OpAmpParams> {
  static override readonly id = "OpAmp";
  static override readonly numTerminals = 3;
  static override readonly paramsSchema = {
    gain: Params.number({ default: 1e6, min: 1, title: "gain" }),
    Vmax: Params.number({ default: 15, min: 0, title: "maximum absolute value of output voltage" }),
  };
  static override readonly stateParams: StateParams = {
    length: S._Size_,
    ops: [
      { index: S.Vin, name: "Vin", unit: "V" },
      { index: S.Vout, name: "Vout", unit: "V" },
    ],
  };

  /** Positive input terminal. */
  readonly np: Node;
  /** Negative input terminal. */
  readonly nn: Node;
  /** Output terminal. */
  readonly no: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  constructor(
    id: string, //
    [np, nn, no]: readonly Node[],
    params: OpAmpParams | null = null,
  ) {
    super(id, [np, nn, no], params);
    this.np = np;
    this.nn = nn;
    this.no = no;
  }

  override connect(network: Network): void {
    this.branch = network.makeBranch(this.no, network.groundNode);
  }

  override deriveState(
    state: DeviceState, //
    { gain, Vmax }: OpAmpParams,
  ): void {
    state[S.gain] = gain;
    state[S.Vmax] = Vmax;
  }

  override eval(state: DeviceState, options: EvalOptions): void {
    const { np, nn } = this;
    const gain = state[S.gain];
    const Vmax = state[S.Vmax];
    const Vin = np.voltage - nn.voltage;
    const c = (piOverTwo * gain * Vin) / Vmax;
    const Vout = Vmax * twoOverPi * Math.atan(c);
    const gv = gain / (1 + c * c) + options.gmin;
    state[S.Vin] = Vin;
    state[S.Vout] = Vout;
    state[S.gv] = gv;
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn, no, branch } = this;
    const Vin = state[S.Vin];
    const Vout = state[S.Vout];
    const gv = state[S.gv];
    stamper.stampMatrix(no, branch, 1);
    stamper.stampMatrix(branch, np, gv);
    stamper.stampMatrix(branch, nn, -gv);
    stamper.stampMatrix(branch, no, -1);
    stamper.stampRightSide(branch, gv * Vin - Vout);
  }
}
