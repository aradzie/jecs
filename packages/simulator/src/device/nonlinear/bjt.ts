import type { Op } from "../../circuit/ops";
import { Device } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import { Params } from "../../circuit/params";
import { Unit } from "../../util/unit";
import { Temp } from "../const";
import { BjtPolarity, bjtSign, npn, PN, pnp } from "./semi";

export interface BjtParams {
  readonly polarity: BjtPolarity;
  readonly Temp: number;
  readonly Is: number;
  readonly Nf: number;
  readonly Nr: number;
  readonly Vaf: number;
  readonly Var: number;
  readonly Bf: number;
  readonly Br: number;
}

interface BjtState {
  prevVbe: number;
  prevVbc: number;
}

/**
 * Bipolar junction transistor, BJT.
 */
export class Bjt extends Device<BjtParams, BjtState> {
  static override readonly id = "BJT";
  static override readonly numTerminals = 3;
  static override readonly paramsSchema = {
    polarity: Params.enum({
      values: [npn, pnp],
      title: "transistor polarity",
    }),
    Temp: Params.number({
      default: Temp,
      title: "device temperature",
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
    Vaf: Params.number({
      default: 10,
      title: "forward Early voltage",
    }),
    Var: Params.number({
      default: 0,
      title: "reverse Early voltage",
    }),
    Bf: Params.number({
      default: 100,
      title: "forward beta",
    }),
    Br: Params.number({
      default: 1,
      title: "reverse beta",
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
    const { Temp, Is, Nf, Nr } = this.params;
    this.pnBe = new PN(Temp, Is, Nf);
    this.pnBc = new PN(Temp, Is, Nr);
  }

  override getInitialState(): BjtState {
    return { prevVbe: 0, prevVbc: 0 };
  }

  override stamp(stamper: Stamper, state: BjtState): void {
    const { params, ne, nb, nc, pnBe, pnBc } = this;
    const { polarity, Bf, Br } = params;
    const sign = bjtSign(polarity);
    const Af = Bf / (Bf + 1);
    const Ar = Br / (Br + 1);
    const Vbe = (state.prevVbe = pnBe.limitVoltage(
      sign * (nb.voltage - ne.voltage),
      state.prevVbe,
    ));
    const Vbc = (state.prevVbc = pnBc.limitVoltage(
      sign * (nb.voltage - nc.voltage),
      state.prevVbc,
    ));
    const Gf = pnBe.evalConductance(Vbe);
    const Gr = pnBc.evalConductance(Vbc);
    const If = pnBe.evalCurrent(Vbe);
    const Ir = pnBc.evalCurrent(Vbc);
    const Ie = Ar * Ir - If;
    const Ic = Af * If - Ir;
    const eqGee = -Gf;
    const eqGcc = -Gr;
    const eqGec = Ar * Gr;
    const eqGce = Af * Gf;
    const eqIe = Ie - eqGee * Vbe - eqGec * Vbc;
    const eqIc = Ic - eqGce * Vbe - eqGcc * Vbc;
    stamper.stampMatrix(ne, ne, -eqGee);
    stamper.stampMatrix(ne, nc, -eqGec);
    stamper.stampMatrix(ne, nb, eqGec + eqGee);
    stamper.stampRightSide(ne, sign * -eqIe);
    stamper.stampMatrix(nc, ne, -eqGce);
    stamper.stampMatrix(nc, nc, -eqGcc);
    stamper.stampMatrix(nc, nb, eqGce + eqGcc);
    stamper.stampRightSide(nc, sign * -eqIc);
    stamper.stampMatrix(nb, ne, eqGce + eqGee);
    stamper.stampMatrix(nb, nc, eqGec + eqGcc);
    stamper.stampMatrix(nb, nb, -(eqGcc + eqGee + eqGce + eqGec));
    stamper.stampRightSide(nb, sign * (eqIe + eqIc));
  }

  override ops(): readonly Op[] {
    const { params, ne, nb, nc, pnBe, pnBc } = this;
    const { polarity, Bf, Br } = params;
    const sign = bjtSign(polarity);
    const Af = Bf / (Bf + 1);
    const Ar = Br / (Br + 1);
    const Vbe = sign * (nb.voltage - ne.voltage);
    const Vbc = sign * (nb.voltage - nc.voltage);
    const Vce = sign * (nc.voltage - ne.voltage);
    const If = pnBe.evalCurrent(Vbe);
    const Ir = pnBc.evalCurrent(Vbc);
    const Ie = Ar * Ir - If;
    const Ic = Af * If - Ir;
    const Ib = -(Ie + Ic);
    return [
      { name: "Vbe", value: sign * Vbe, unit: Unit.VOLT },
      { name: "Vbc", value: sign * Vbc, unit: Unit.VOLT },
      { name: "Vce", value: sign * Vce, unit: Unit.VOLT },
      { name: "Ie", value: sign * Ie, unit: Unit.AMPERE },
      { name: "Ic", value: sign * Ic, unit: Unit.AMPERE },
      { name: "Ib", value: sign * Ib, unit: Unit.AMPERE },
    ];
  }
}
