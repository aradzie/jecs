import { Device, StateParams } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params, ParamsSchema } from "../../circuit/params";
import { Unit } from "../../util/unit";

export interface CCCSourceParams {
  readonly gain: number;
}

/**
 * Current-controlled current source.
 */
export class CCCSource extends Device<CCCSourceParams> {
  static override readonly id = "CCCS";
  static override readonly numTerminals = 4;
  static override readonly paramsSchema: ParamsSchema<CCCSourceParams> = {
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

  constructor(id: string, [np, nn, ncp, ncn]: readonly Node[], params: CCCSourceParams) {
    super(id, [np, nn, ncp, ncn], params);
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.ncp, this.ncn);
  }

  override stamp(stamper: Stamper): void {
    const { params, np, nn, ncp, ncn, branch } = this;
    const { gain } = params;
    stamper.stampVoltageSource(ncp, ncn, branch, 0);
    stamper.stampMatrix(np, branch, gain);
    stamper.stampMatrix(nn, branch, -gain);
  }

  override ops(): readonly Op[] {
    const { params, np, nn, branch } = this;
    const { gain } = params;
    const voltage = np.voltage - nn.voltage;
    const current = branch.current * gain;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
    ];
  }
}
