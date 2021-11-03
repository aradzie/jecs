import { Device, DeviceState, StateParams } from "../../circuit/device";
import type { DeviceModel } from "../../circuit/library";
import type { Node, Stamper } from "../../circuit/network";
import { Params, ParamsSchema } from "../../circuit/params";
import { Temp } from "../const";
import { PN } from "./semi";

export interface DiodeParams {
  readonly Is: number;
  readonly N: number;
  readonly Temp: number;
}

const enum S {
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
  /** The PN junction of diode. */
  readonly pn: PN;

  constructor(id: string, [na, nc]: readonly Node[], params: DiodeParams) {
    super(id, [na, nc], params);
    this.na = na;
    this.nc = nc;
    const { Is, N, Temp } = this.params;
    this.pn = new PN(Is, N, Temp);
  }

  override eval(state: DeviceState, final: boolean): void {
    const { na, nc, pn } = this;
    let V = na.voltage - nc.voltage;
    if (!final) {
      V = pn.limitVoltage(V, state[S.V]);
    }
    const I = pn.evalCurrent(V);
    const G = pn.evalConductance(V);
    const P = V * I;
    state[S.V] = V;
    state[S.I] = I;
    state[S.G] = G;
    state[S.P] = P;
  }

  override stamp(stamper: Stamper, [V, I, G, P]: DeviceState): void {
    const { na, nc } = this;
    stamper.stampConductance(na, nc, G);
    stamper.stampCurrentSource(na, nc, I - G * V);
  }
}
