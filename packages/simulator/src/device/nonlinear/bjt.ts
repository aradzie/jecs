import { Device, DeviceState, StateParams } from "../../circuit/device";
import type { DeviceModel } from "../../circuit/library";
import type { Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params, ParamsSchema } from "../../circuit/params";
import { Unit } from "../../util/unit";
import { Temp } from "../const";
import { BjtPolarity, bjtSign, npn, PN, pnp } from "./semi";

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
  /** Base-emitter voltage. */
  Vbe,
  /** Base-collector voltage. */
  Vbc,
  /** Forward alpha. */
  Af,
  /** Reverse alpha. */
  Ar,
  /** Emitter current. */
  Ie,
  /** Collector current. */
  Ic,
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
    outputs: [
      { index: S.Vbe, name: "Vbe", unit: "V" },
      { index: S.Vbc, name: "Vbc", unit: "V" },
      //{ index: S.Vce, name: "Vce", unit: "V" },
      { index: S.Ie, name: "Ie", unit: "A" },
      { index: S.Ic, name: "Ic", unit: "A" },
      //{ index: S.Ib, name: "Ib", unit: "A" },
    ],
  };

  /** The emitter terminal. */
  readonly ne: Node;
  /** The base terminal. */
  readonly nb: Node;
  /** The collector terminal. */
  readonly nc: Node;
  /** The base-emitter PN junction of BJT. */
  private readonly pnBe: PN;
  /** The base-collector PN junction of BJT. */
  private readonly pnBc: PN;

  constructor(id: string, [ne, nb, nc]: readonly Node[], params: BjtParams) {
    super(id, [ne, nb, nc], params);
    this.ne = ne;
    this.nb = nb;
    this.nc = nc;
    const { Is, Nf, Nr, Temp } = this.params;
    this.pnBe = new PN(Is, Nf, Temp);
    this.pnBc = new PN(Is, Nr, Temp);
  }

  override eval(state: DeviceState): void {
    const { ne, nb, nc, pnBe, params, pnBc } = this;
    const { polarity, Bf, Br } = params;
    const sign = bjtSign(polarity);
    const Vbe = (state[S.Vbe] = pnBe.limitVoltage(sign * (nb.voltage - ne.voltage), state[S.Vbe]));
    const Vbc = (state[S.Vbc] = pnBc.limitVoltage(sign * (nb.voltage - nc.voltage), state[S.Vbc]));
    const If = pnBe.evalCurrent(Vbe);
    const Ir = pnBc.evalCurrent(Vbc);
    const Af = (state[S.Af] = Bf / (Bf + 1));
    const Ar = (state[S.Ar] = Br / (Br + 1));
    state[S.Ie] = Ar * Ir - If;
    state[S.Ic] = Af * If - Ir;
    state[S.Gf] = pnBe.evalConductance(Vbe);
    state[S.Gr] = pnBc.evalConductance(Vbc);
  }

  override stamp(stamper: Stamper, [Vbe, Vbc, Af, Ar, Ie, Ic, Gf, Gr]: DeviceState): void {
    const { ne, nb, nc, params } = this;
    const { polarity } = params;
    const sign = bjtSign(polarity);
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
    stamper.stampCurrentSource(ne, nb, sign * (Ie - eqGee * Vbe - eqGec * Vbc));
    stamper.stampCurrentSource(nc, nb, sign * (Ic - eqGce * Vbe - eqGcc * Vbc));
  }

  override ops([VbeX, VbcX, Af, Ar, Ie, Ic, Gf, Gr]: DeviceState = this.state): readonly Op[] {
    const { ne, nb, nc, params } = this;
    const { polarity } = params;
    const sign = bjtSign(polarity);
    const Vbe = sign * (nb.voltage - ne.voltage);
    const Vbc = sign * (nb.voltage - nc.voltage);
    return [
      { name: "Vbe", value: sign * Vbe, unit: Unit.VOLT },
      { name: "Vbc", value: sign * Vbc, unit: Unit.VOLT },
      { name: "Vce", value: sign * (Vbe - Vbc), unit: Unit.VOLT },
      { name: "Ie", value: sign * Ie, unit: Unit.AMPERE },
      { name: "Ic", value: sign * Ic, unit: Unit.AMPERE },
      { name: "Ib", value: sign * -(Ie + Ic), unit: Unit.AMPERE },
    ];
  }
}
