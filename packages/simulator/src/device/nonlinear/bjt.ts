import { Device, DeviceState, EvalOptions, StateParams } from "../../circuit/device";
import type { DeviceModel } from "../../circuit/library";
import type { Node, Stamper } from "../../circuit/network";
import { Params, ParamsSchema } from "../../circuit/params";
import { Temp } from "../const";
import {
  BjtPolarity,
  bjtSign,
  npn,
  pnConductance,
  pnCurrent,
  pnp,
  pnVcrit,
  pnVoltage,
  pnVt,
} from "./semi";

export interface BjtParams {
  readonly polarity: BjtPolarity;
  readonly Bf: number;
  readonly Br: number;
  readonly Is: number;
  readonly Nf: number;
  readonly Nr: number;
  readonly Vaf: number;
  readonly Var: number;
  readonly Temp: number;
}

const enum S {
  /** Device polarity, +1 for npn, -1 for pnp. */
  pol,
  /** Forward alpha. */
  Af,
  /** Reverse alpha. */
  Ar,
  /** Saturation current. */
  Is,
  /** Base-emitter thermal voltage. */
  Vtf,
  /** Base-collector thermal voltage. */
  Vtr,
  /** Base-emitter critical voltage. */
  Vcritf,
  /** Base-collector critical voltage. */
  Vcritr,
  /** Base-emitter voltage. */
  Vbe,
  /** Base-collector voltage. */
  Vbc,
  /** Collector-emitter voltage. */
  Vce,
  /** Emitter current. */
  Ie,
  /** Collector current. */
  Ic,
  /** Base current. */
  Ib,
  /** Forward transconductance. */
  Gf,
  /** Reverse transconductance. */
  Gr,
  _Size_,
}

/**
 * Bipolar junction transistor, BJT.
 */
export class Bjt extends Device<BjtParams> {
  static modelNpn = Object.freeze<BjtParams>({
    polarity: "npn",
    Bf: 100.0,
    Br: 1.0,
    Is: 1e-14,
    Nf: 1,
    Nr: 1,
    Vaf: 10.0,
    Var: 0.0,
    Temp,
  });
  static modelPnp = Object.freeze<BjtParams>({
    polarity: "pnp",
    Bf: 100.0,
    Br: 1.0,
    Is: 1e-14,
    Nf: 1,
    Nr: 1,
    Vaf: 10.0,
    Var: 0.0,
    Temp,
  });

  static override getModels(): readonly DeviceModel[] {
    return [
      ["NPN", Bjt.modelNpn],
      ["PNP", Bjt.modelPnp],
    ];
  }

  static override readonly id = "BJT";
  static override readonly numTerminals = 3;
  static override readonly paramsSchema: ParamsSchema<BjtParams> = {
    polarity: Params.enum({
      values: [npn, pnp],
      title: "transistor polarity",
    }),
    Bf: Params.number({
      default: 100.0,
      min: 1e-3,
      title: "forward beta",
    }),
    Br: Params.number({
      default: 1.0,
      min: 1e-3,
      title: "reverse beta",
    }),
    Is: Params.number({
      default: 1e-14,
      min: 0,
      title: "saturation current",
    }),
    Nf: Params.number({
      default: 1,
      min: 1e-3,
      max: 100,
      title: "forward emission coefficient",
    }),
    Nr: Params.number({
      default: 1,
      min: 1e-3,
      max: 100,
      title: "reverse emission coefficient",
    }),
    Vaf: Params.number({
      default: 10.0,
      min: 0,
      title: "forward Early voltage",
    }),
    Var: Params.number({
      default: 0.0,
      min: 0,
      title: "reverse Early voltage",
    }),
    Temp: Params.Temp,
  };
  static override readonly stateParams: StateParams = {
    length: S._Size_,
    ops: [
      { index: S.Vbe, name: "Vbe", unit: "V" },
      { index: S.Vbc, name: "Vbc", unit: "V" },
      { index: S.Vce, name: "Vce", unit: "V" },
      { index: S.Ie, name: "Ie", unit: "A" },
      { index: S.Ic, name: "Ic", unit: "A" },
      { index: S.Ib, name: "Ib", unit: "A" },
    ],
  };

  /** The emitter terminal. */
  readonly ne: Node;
  /** The base terminal. */
  readonly nb: Node;
  /** The collector terminal. */
  readonly nc: Node;

  constructor(
    id: string, //
    [ne, nb, nc]: readonly Node[],
    params: BjtParams | null = null,
  ) {
    super(id, [ne, nb, nc], params);
    this.ne = ne;
    this.nb = nb;
    this.nc = nc;
  }

  override deriveState(
    state: DeviceState, //
    { polarity, Bf, Br, Is, Nf, Nr, Vaf, Var, Temp }: BjtParams,
  ): void {
    const pol = bjtSign(polarity);
    const Af = Bf / (Bf + 1);
    const Ar = Br / (Br + 1);
    const Vtf = Nf * pnVt(Temp);
    const Vtr = Nr * pnVt(Temp);
    const Vcritf = pnVcrit(Is, Vtf);
    const Vcritr = pnVcrit(Is, Vtr);
    state[S.pol] = pol;
    state[S.Af] = Af;
    state[S.Ar] = Ar;
    state[S.Is] = Is;
    state[S.Vtf] = Vtf;
    state[S.Vtr] = Vtr;
    state[S.Vcritf] = Vcritf;
    state[S.Vcritr] = Vcritr;
  }

  override eval(
    state: DeviceState, //
    { damped, gmin }: EvalOptions,
  ): void {
    const { ne, nb, nc } = this;
    const pol = state[S.pol];
    const Af = state[S.Af];
    const Ar = state[S.Ar];
    const Is = state[S.Is];
    const Vtf = state[S.Vtf];
    const Vtr = state[S.Vtr];
    const Vcritf = state[S.Vcritf];
    const Vcritr = state[S.Vcritr];
    let Vbe = pol * (nb.voltage - ne.voltage);
    let Vbc = pol * (nb.voltage - nc.voltage);
    if (damped) {
      Vbe = pnVoltage(Vbe, pol * state[S.Vbe], Vtf, Vcritf);
      Vbc = pnVoltage(Vbc, pol * state[S.Vbc], Vtr, Vcritr);
    }
    const If = pnCurrent(Vbe, Is, Vtf);
    const Ir = pnCurrent(Vbc, Is, Vtr);
    const Ie = Ar * Ir - If;
    const Ic = Af * If - Ir;
    const Gf = pnConductance(Vbe, Is, Vtf);
    const Gr = pnConductance(Vbc, Is, Vtr);
    state[S.Vbe] = pol * Vbe;
    state[S.Vbc] = pol * Vbc;
    state[S.Vce] = pol * (Vbe - Vbc);
    state[S.Ie] = pol * Ie;
    state[S.Ic] = pol * Ic;
    state[S.Ib] = pol * -(Ie + Ic);
    state[S.Gf] = Gf;
    state[S.Gr] = Gr;
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { ne, nb, nc } = this;
    const pol = state[S.pol];
    const Af = state[S.Af];
    const Ar = state[S.Ar];
    const Vbe = pol * state[S.Vbe];
    const Vbc = pol * state[S.Vbc];
    const Ie = pol * state[S.Ie];
    const Ic = pol * state[S.Ic];
    const Gf = state[S.Gf];
    const Gr = state[S.Gr];
    const Gee = -Gf;
    const Gcc = -Gr;
    const Gec = Ar * Gr;
    const Gce = Af * Gf;
    stamper.stampConductance(ne, nb, -Gee);
    stamper.stampConductance(nc, nb, -Gcc);
    stamper.stampTransconductance(ne, nb, nc, nb, -Gec);
    stamper.stampTransconductance(nc, nb, ne, nb, -Gce);
    stamper.stampCurrentSource(ne, nb, pol * (Ie - Gee * Vbe - Gec * Vbc));
    stamper.stampCurrentSource(nc, nb, pol * (Ic - Gce * Vbe - Gcc * Vbc));
  }
}
