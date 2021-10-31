import { Device, StateParams } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params, ParamsSchema } from "../../circuit/params";
import { Unit } from "../../util/unit";

export interface VCCSourceParams {
  readonly gain: number;
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
    length: 0,
    outputs: [],
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

  constructor(name: string, [np, nn, ncp, ncn]: readonly Node[], params: VCCSourceParams) {
    super(name, [np, nn, ncp, ncn], params);
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.np, this.nn);
  }

  override stamp(stamper: Stamper): void {
    const { params, np, nn, ncp, ncn, branch } = this;
    const { gain } = params;
    stamper.stampMatrix(np, branch, 1);
    stamper.stampMatrix(nn, branch, -1);
    stamper.stampMatrix(branch, ncp, gain);
    stamper.stampMatrix(branch, ncn, -gain);
    stamper.stampMatrix(branch, branch, -1);
  }

  override ops(): readonly Op[] {
    const { np, nn, branch } = this;
    const voltage = np.voltage - nn.voltage;
    const current = branch.current;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
    ];
  }
}
