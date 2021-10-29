import { Device } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params, ParamsItem } from "../../circuit/params";
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
  static override readonly paramsSchema: Record<
    keyof VSourceParams, //
    ParamsItem
  > = {
    V: Params.number({ title: "voltage" }),
  };

  /** Positive terminal. */
  readonly np: Node;
  /** Negative terminal. */
  readonly nn: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  constructor(name: string, [np, nn]: readonly Node[], params: VSourceParams) {
    super(name, [np, nn], params);
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
