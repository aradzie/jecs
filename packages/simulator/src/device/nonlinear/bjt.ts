import { Device, DeviceState, StateParams } from "../../circuit/device";
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
  readonly Is: number;
  readonly Nf: number;
  readonly Nr: number;
  readonly Bf: number;
  readonly Br: number;
  readonly Vaf: number;
  readonly Var: number;
  readonly Temp: number;
}

const enum S {
  /** Device polarity, +1 for npn, -1 for pnp. */
  pol,
  /** Base-emitter voltage. */
  Vbe,
  /** Base-collector voltage. */
  Vbc,
  /** Collector-emitter voltage. */
  Vce,
  /** Forward alpha. */
  Af,
  /** Reverse alpha. */
  Ar,
  /** Emitter current. */
  Ie,
  /** Collector current. */
  Ic,
  /** Base current. */ Ib,
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
    Is: 1e-14,
    Nf: 1,
    Nr: 1,
    Bf: 100.0,
    Br: 1.0,
    Vaf: 10.0,
    Var: 0.0,
    Temp,
  });
  static modelPnp = Object.freeze<BjtParams>({
    polarity: "pnp",
    Is: 1e-14,
    Nf: 1,
    Nr: 1,
    Bf: 100.0,
    Br: 1.0,
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

  constructor(id: string, [ne, nb, nc]: readonly Node[], params: BjtParams) {
    super(id, [ne, nb, nc], params);
    this.ne = ne;
    this.nb = nb;
    this.nc = nc;
  }

  override eval(state: DeviceState, final: boolean): void {
    const { params, ne, nb, nc } = this;
    const { polarity, Bf, Br, Is, Nf, Nr, Temp } = params;
    const Vtf = Nf * pnVt(Temp);
    const Vtr = Nr * pnVt(Temp);
    const pol = bjtSign(polarity);
    let Vbe = pol * (nb.voltage - ne.voltage);
    let Vbc = pol * (nb.voltage - nc.voltage);
    if (!final) {
      Vbe = pnVoltage(Vbe, pol * state[S.Vbe], Vtf, pnVcrit(Is, Vtf));
      Vbc = pnVoltage(Vbc, pol * state[S.Vbc], Vtr, pnVcrit(Is, Vtr));
    }
    const If = pnCurrent(Vbe, Is, Vtf);
    const Ir = pnCurrent(Vbc, Is, Vtr);
    const Af = Bf / (Bf + 1);
    const Ar = Br / (Br + 1);
    const Ie = Ar * Ir - If;
    const Ic = Af * If - Ir;
    const Gf = pnConductance(Vbe, Is, Vtf);
    const Gr = pnConductance(Vbc, Is, Vtr);
    state[S.pol] = pol;
    state[S.Vbe] = pol * Vbe;
    state[S.Vbc] = pol * Vbc;
    state[S.Vce] = pol * (Vbe - Vbc);
    state[S.Af] = Af;
    state[S.Ar] = Ar;
    state[S.Ie] = pol * Ie;
    state[S.Ic] = pol * Ic;
    state[S.Ib] = pol * -(Ie + Ic);
    state[S.Gf] = Gf;
    state[S.Gr] = Gr;
  }

  override stamp(stamper: Stamper, state: DeviceState): void {
    const { ne, nb, nc } = this;
    const pol = state[S.pol];
    const Vbe = state[S.Vbe];
    const Vbc = state[S.Vbc];
    const Af = state[S.Af];
    const Ar = state[S.Ar];
    const Ie = state[S.Ie];
    const Ic = state[S.Ic];
    const Gf = state[S.Gf];
    const Gr = state[S.Gr];
    const eqGee = -Gf;
    const eqGcc = -Gr;
    const eqGec = Ar * Gr;
    const eqGce = Af * Gf;
    stamper.stampMatrix(ne, ne, -eqGee);
    stamper.stampMatrix(ne, nc, -eqGec);
    stamper.stampMatrix(ne, nb, eqGec + eqGee);
    stamper.stampMatrix(nc, ne, -eqGce);
    stamper.stampMatrix(nc, nc, -eqGcc);
    stamper.stampMatrix(nc, nb, eqGce + eqGcc);
    stamper.stampMatrix(nb, ne, eqGce + eqGee);
    stamper.stampMatrix(nb, nc, eqGec + eqGcc);
    stamper.stampMatrix(nb, nb, -(eqGcc + eqGee + eqGce + eqGec));
    stamper.stampCurrentSource(ne, nb, pol * (pol * Ie - pol * eqGee * Vbe - pol * eqGec * Vbc));
    stamper.stampCurrentSource(nc, nb, pol * (pol * Ic - pol * eqGce * Vbe - pol * eqGcc * Vbc));
  }
}
