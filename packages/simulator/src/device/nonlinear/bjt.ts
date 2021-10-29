import { Device } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params } from "../../circuit/params";
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

interface BjtState {
  /** Base-emitter voltage. */
  Vbe: number;
  /** Base-collector voltage. */
  Vbc: number;
  /** Forward alpha. */
  Af: number;
  /** Reverse alpha. */
  Ar: number;
  /** Emitter current. */
  Ie: number;
  /** Collector current. */
  Ic: number;
  /** Forward transconductance. */
  Gf: number;
  /** Reverse transconductance. */
  Gr: number;
}

/**
 * Bipolar junction transistor, BJT.
 */
export class Bjt extends Device<BjtParams, BjtState> {
  static modelNpn = Object.freeze<BjtParams>({
    polarity: "npn",
    Is: 1e-14,
    Nf: 1,
    Nr: 1,
    Bf: 100.0,
    Br: 1.0,
    Vaf: 100.0,
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

  static override readonly id = "BJT";
  static override readonly numTerminals = 3;
  static override readonly paramsSchema = {
    polarity: Params.enum({
      values: [npn, pnp],
      title: "transistor polarity",
    }),
    Is: Params.number({
      default: 1e-14,
      title: "saturation current",
    }),
    Nf: Params.number({
      default: 1,
      title: "forward emission coefficient",
    }),
    Nr: Params.number({
      default: 1,
      title: "reverse emission coefficient",
    }),
    Bf: Params.number({
      default: 100.0,
      title: "forward beta",
    }),
    Br: Params.number({
      default: 1.0,
      title: "reverse beta",
    }),
    Vaf: Params.number({
      default: 10.0,
      title: "forward Early voltage",
    }),
    Var: Params.number({
      default: 0.0,
      title: "reverse Early voltage",
    }),
    Temp: Params.number({
      default: Temp,
      title: "device temperature",
    }),
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

  constructor(name: string, [ne, nb, nc]: readonly Node[], params: BjtParams) {
    super(name, [ne, nb, nc], params);
    this.ne = ne;
    this.nb = nb;
    this.nc = nc;
    const { Is, Nf, Nr, Temp } = this.params;
    this.pnBe = new PN(Is, Nf, Temp);
    this.pnBc = new PN(Is, Nr, Temp);
  }

  override getInitialState(): BjtState {
    return {
      Vbe: 0,
      Vbc: 0,
      Af: 0,
      Ar: 0,
      Ie: 0,
      Ic: 0,
      Gf: 0,
      Gr: 0,
    };
  }

  override eval(state: BjtState): void {
    const { params, ne, nb, nc, pnBe, pnBc } = this;
    const { polarity, Bf, Br } = params;
    const sign = bjtSign(polarity);
    const Vbe = (state.Vbe = pnBe.limitVoltage(
      sign * (nb.voltage - ne.voltage),
      state.Vbe,
    ));
    const Vbc = (state.Vbc = pnBc.limitVoltage(
      sign * (nb.voltage - nc.voltage),
      state.Vbc,
    ));
    const If = pnBe.evalCurrent(Vbe);
    const Ir = pnBc.evalCurrent(Vbc);
    const Af = (state.Af = Bf / (Bf + 1));
    const Ar = (state.Ar = Br / (Br + 1));
    state.Ie = Ar * Ir - If;
    state.Ic = Af * If - Ir;
    state.Gf = pnBe.evalConductance(Vbe);
    state.Gr = pnBc.evalConductance(Vbc);
  }

  override stamp(
    stamper: Stamper,
    {
      Vbe,
      Vbc,
      Af,
      Ar,
      Ie,
      Ic,
      Gf,
      Gr, //
    }: BjtState,
  ): void {
    const { params, ne, nb, nc } = this;
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

  override ops(
    {
      Vbe,
      Vbc,
      Af,
      Ar,
      Ie,
      Ic,
      Gf,
      Gr, //
    }: BjtState = this.state,
  ): readonly Op[] {
    const { params } = this;
    const { polarity } = params;
    const sign = bjtSign(polarity);
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
