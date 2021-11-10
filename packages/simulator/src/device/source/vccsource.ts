import { Device, DeviceState, StateParams } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import { Params, ParamsSchema } from "../../circuit/params";

export interface VCCSourceParams {
  readonly gain: number;
}

const enum S {
  gain,
  I,
  V,
  P,
  _Size_,
}

/**
 * Voltage-controlled current source.
 */
export class VCCSource extends Device<VCCSourceParams> {
  static override readonly id = "VCCS";
  static override readonly numTerminals = 4;
  static override readonly paramsSchema: ParamsSchema<VCCSourceParams> = {
    gain: Params.number({ title: "gain" }),
  };
  static override readonly stateParams: StateParams = {
    length: S._Size_,
    ops: [
      { index: S.I, name: "I", unit: "A" },
      { index: S.V, name: "V", unit: "V" },
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
    params: VCCSourceParams | null = null,
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

  override deriveState(state: DeviceState, { gain }: VCCSourceParams): void {
    state[S.gain] = gain;
  }

  override eval(state: DeviceState, final: boolean): void {
    const { np, nn, branch } = this;
    const I = branch.current;
    const V = np.voltage - nn.voltage;
    const P = V * I;
    state[S.I] = I;
    state[S.V] = V;
    state[S.P] = P;
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn, ncp, ncn, branch } = this;
    const gain = state[S.gain];
    stamper.stampMatrix(np, branch, 1);
    stamper.stampMatrix(nn, branch, -1);
    stamper.stampMatrix(branch, ncp, gain);
    stamper.stampMatrix(branch, ncn, -gain);
    stamper.stampMatrix(branch, branch, -1);
  }
}
