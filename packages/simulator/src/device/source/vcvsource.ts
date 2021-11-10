import { Device, DeviceState, EvalOptions, StateParams } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import { Params, ParamsSchema } from "../../circuit/params";

export interface VCVSourceParams {
  readonly gain: number;
}

const enum S {
  gain,
  V,
  I,
  P,
  _Size_,
}

/**
 * Voltage-controlled voltage source.
 */
export class VCVSource extends Device<VCVSourceParams> {
  static override readonly id = "VCVS";
  static override readonly numTerminals = 4;
  static override readonly paramsSchema: ParamsSchema<VCVSourceParams> = {
    gain: Params.number({ title: "gain" }),
  };
  static override readonly stateParams: StateParams = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.I, name: "I", unit: "A" },
      { index: S.P, name: "P", unit: "W" },
    ],
  };

  /** Positive output terminal. */
  readonly np: Node;
  /** Negative output terminal. */
  readonly nn: Node;
  /** Positive control terminal. */
  readonly ncp: Node;
  /** Negative control terminal. */
  readonly ncn: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  constructor(
    id: string, //
    [np, nn, ncp, ncn]: readonly Node[],
    params: VCVSourceParams | null = null,
  ) {
    super(id, [np, nn, ncp, ncn], params);
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
  }

  override connect(network: Network): void {
    this.branch = network.makeBranch(this.np, this.nn);
  }

  override deriveState(state: DeviceState, { gain }: VCVSourceParams): void {
    state[S.gain] = gain;
  }

  override eval(state: DeviceState, options: EvalOptions): void {
    const { np, nn, branch } = this;
    const V = np.voltage - nn.voltage;
    const I = branch.current;
    const P = V * I;
    state[S.V] = V;
    state[S.I] = I;
    state[S.P] = P;
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn, ncp, ncn, branch } = this;
    const gain = state[S.gain];
    stamper.stampVoltageSource(np, nn, branch, 0);
    stamper.stampMatrix(branch, ncp, -gain);
    stamper.stampMatrix(branch, ncn, gain);
  }
}
