import { Device } from "../../circuit/device";
import type { DeviceModel } from "../../circuit/library";
import type { Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params, ParamsSchema } from "../../circuit/params";
import { Unit } from "../../util/unit";
import { Temp } from "../const";
import { PN } from "./semi";

export interface DiodeParams {
  readonly Is: number;
  readonly N: number;
  readonly Temp: number;
}

const enum S {
  Vd,
  Id,
  Gd,
  _Size_,
}

/**
 * Diode.
 */
export class Diode extends Device<DiodeParams, Float64Array> {
  static override getModels(): readonly DeviceModel[] {
    return [["Diode", Diode.modelDiode]];
  }

  static modelDiode = Object.freeze<DiodeParams>({
    Is: 1e-14,
    N: 1,
    Temp,
  });

  static override readonly id = "Diode";
  static override readonly numTerminals = 2;
  static override readonly paramsSchema: ParamsSchema<DiodeParams> = {
    Is: Params.number({
      default: 1e-14,
      min: 0,
      title: "saturation current",
    }),
    N: Params.number({
      default: 1,
      min: 1e-3,
      max: 100,
      title: "emission coefficient",
    }),
    Temp: Params.Temp,
  };

  /** The anode terminal. */
  readonly na: Node;
  /** The cathode terminal. */
  readonly nc: Node;
  /** The PN junction of diode. */
  readonly pn: PN;

  constructor(name: string, [na, nc]: readonly Node[], params: DiodeParams) {
    super(name, [na, nc], params);
    this.na = na;
    this.nc = nc;
    const { Is, N, Temp } = this.params;
    this.pn = new PN(Is, N, Temp);
  }

  override getInitialState(): Float64Array {
    return new Float64Array(S._Size_);
  }

  override eval(state: Float64Array): void {
    const { na, nc, pn } = this;
    const Vd = (state[S.Vd] = pn.limitVoltage(na.voltage - nc.voltage, state[S.Vd]));
    state[S.Id] = pn.evalCurrent(Vd);
    state[S.Gd] = pn.evalConductance(Vd);
  }

  override stamp(stamper: Stamper, [Vd, Id, Gd]: Float64Array): void {
    const { na, nc } = this;
    stamper.stampConductance(na, nc, Gd);
    stamper.stampCurrentSource(na, nc, Id - Gd * Vd);
  }

  override ops([VdX, Id, Gd]: Float64Array = this.state): readonly Op[] {
    const { na, nc } = this;
    const Vd = na.voltage - nc.voltage;
    return [
      { name: "Vd", value: Vd, unit: Unit.VOLT },
      { name: "I", value: Id, unit: Unit.AMPERE },
      { name: "P", value: Vd * Id, unit: Unit.WATT },
    ];
  }
}
