import { Device } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { DeviceModel, Params, ParamsItem } from "../../circuit/params";
import { Unit } from "../../util/unit";
import { Temp } from "../const";
import { PN } from "./semi";

export interface DiodeParams {
  readonly Is: number;
  readonly N: number;
  readonly Temp: number;
}

interface DiodeState {
  Vd: number;
  Id: number;
  Gd: number;
}

/**
 * Diode.
 */
export class Diode extends Device<DiodeParams, DiodeState> {
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
  static override readonly paramsSchema: Record<
    keyof DiodeParams, //
    ParamsItem
  > = {
    Is: Params.number({
      default: 1e-14,
      title: "saturation current",
    }),
    N: Params.number({
      default: 1,
      title: "emission coefficient",
    }),
    Temp: Params.number({
      default: Temp,
      title: "device temperature",
    }),
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

  override getInitialState(): DiodeState {
    return {
      Vd: 0,
      Id: 0,
      Gd: 0,
    };
  }

  override eval(state: DiodeState): void {
    const { na, nc, pn } = this;
    const Vd = (state.Vd = pn.limitVoltage(na.voltage - nc.voltage, state.Vd));
    state.Id = pn.evalCurrent(Vd);
    state.Gd = pn.evalConductance(Vd);
  }

  override stamp(
    stamper: Stamper,
    {
      Vd,
      Id,
      Gd, //
    }: DiodeState,
  ): void {
    const { na, nc } = this;
    stamper.stampConductance(na, nc, Gd);
    stamper.stampCurrentSource(na, nc, Id - Gd * Vd);
  }

  override ops(
    {
      Vd,
      Id,
      Gd, //
    }: DiodeState = this.state,
  ): readonly Op[] {
    return [
      { name: "Vd", value: Vd, unit: Unit.VOLT },
      { name: "I", value: Id, unit: Unit.AMPERE },
      { name: "P", value: Vd * Id, unit: Unit.WATT },
    ];
  }
}
