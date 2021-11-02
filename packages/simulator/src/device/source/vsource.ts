import { Device, StateParams } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params, ParamsSchema } from "../../circuit/params";
import { Unit } from "../../util/unit";

export interface VSourceParams {
  readonly V: number;
}

/**
 * Voltage source.
 */
export class VSource extends Device<VSourceParams> {
  static override readonly id = "V";
  static override readonly numTerminals = 2;
  static override readonly paramsSchema: ParamsSchema<VSourceParams> = {
    V: Params.number({ title: "voltage" }),
  };
  static override readonly stateParams: StateParams = {
    length: 0,
    outputs: [],
  };

  /** Positive terminal. */
  readonly np: Node;
  /** Negative terminal. */
  readonly nn: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  constructor(id: string, [np, nn]: readonly Node[], params: VSourceParams) {
    super(id, [np, nn], params);
    this.np = np;
    this.nn = nn;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.np, this.nn);
  }

  override stamp(stamper: Stamper): void {
    const { params, np, nn, branch } = this;
    const { V } = params;
    stamper.stampVoltageSource(np, nn, branch, V);
  }

  override ops(): readonly Op[] {
    const { params, branch } = this;
    const { V } = params;
    const current = branch.current;
    const power = V * current;
    return [
      { name: "Vd", value: V, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
