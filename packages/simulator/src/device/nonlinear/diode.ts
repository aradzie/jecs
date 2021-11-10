import { Device, DeviceState, EvalOptions, StateParams } from "../../circuit/device";
import type { DeviceModel } from "../../circuit/library";
import type { Node, Stamper } from "../../circuit/network";
import { Params, ParamsSchema } from "../../circuit/params";
import { Temp } from "../const";
import { pnConductance, pnCurrent, pnVcrit, pnVoltage, pnVt } from "./semi";

export interface DiodeParams {
  readonly Is: number;
  readonly N: number;
  readonly Temp: number;
}

const enum S {
  Is,
  N,
  Vt,
  Vcrit,
  V,
  I,
  G,
  P,
  _Size_,
}

/**
 * Diode.
 */
export class Diode extends Device<DiodeParams> {
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
  static override readonly stateParams: StateParams = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.I, name: "I", unit: "A" },
      { index: S.P, name: "P", unit: "W" },
    ],
  };

  /** The anode terminal. */
  readonly na: Node;
  /** The cathode terminal. */
  readonly nc: Node;

  constructor(
    id: string, //
    [na, nc]: readonly Node[],
    params: DiodeParams | null = null,
  ) {
    super(id, [na, nc], params);
    this.na = na;
    this.nc = nc;
  }

  override deriveState(
    state: DeviceState, //
    { Is, N, Temp }: DiodeParams,
  ): void {
    const Vt = N * pnVt(Temp);
    const Vcrit = pnVcrit(Is, Vt);
    state[S.Is] = Is;
    state[S.Vt] = Vt;
    state[S.Vcrit] = Vcrit;
  }

  override eval(
    state: DeviceState, //
    { damped, gmin }: EvalOptions,
  ): void {
    const { na, nc } = this;
    const Is = state[S.Is];
    const Vt = state[S.Vt];
    const Vcrit = state[S.Vcrit];
    let V = na.voltage - nc.voltage;
    if (damped) {
      V = pnVoltage(V, state[S.V], Vt, Vcrit);
    }
    const I = pnCurrent(V, Is, Vt);
    const G = pnConductance(V, Is, Vt);
    const P = V * I;
    state[S.V] = V;
    state[S.I] = I;
    state[S.G] = G;
    state[S.P] = P;
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { na, nc } = this;
    const V = state[S.V];
    const I = state[S.I];
    const G = state[S.G];
    stamper.stampConductance(na, nc, G);
    stamper.stampCurrentSource(na, nc, I - G * V);
  }
}
