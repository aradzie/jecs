import { Device, DeviceState, EvalOptions, StateParams } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import { Params, ParamsSchema } from "../../circuit/params";

export interface CCVSourceParams {
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
 * Current-controlled voltage source.
 */
export class CCVSource extends Device<CCVSourceParams> {
  static override readonly id = "CCVS";
  static override readonly numTerminals = 4;
  static override readonly paramsSchema: ParamsSchema<CCVSourceParams> = {
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
  private branch1!: Branch;
  /** Extra MNA branch. */
  private branch2!: Branch;

  constructor(
    id: string, //
    [np, nn, ncp, ncn]: readonly Node[],
    params: CCVSourceParams | null = null,
  ) {
    super(id, [np, nn, ncp, ncn], params);
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
  }

  override connect(network: Network): void {
    this.branch1 = network.makeBranch(this.np, this.nn);
    this.branch2 = network.makeBranch(this.ncp, this.ncn);
  }

  override deriveState(state: DeviceState, { gain }: CCVSourceParams): void {
    state[S.gain] = gain;
  }

  override eval(state: DeviceState, options: EvalOptions): void {
    const { np, nn, branch1 } = this;
    const V = np.voltage - nn.voltage;
    const I = branch1.current;
    const P = V * I;
    state[S.V] = V;
    state[S.I] = I;
    state[S.P] = P;
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn, branch1, ncp, ncn, branch2 } = this;
    const gain = state[S.gain];
    stamper.stampVoltageSource(np, nn, branch1, 0);
    stamper.stampVoltageSource(ncp, ncn, branch2, 0);
    stamper.stampMatrix(branch1, branch2, -gain);
  }
}
