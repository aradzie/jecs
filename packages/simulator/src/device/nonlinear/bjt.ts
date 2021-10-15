import type { Op } from "../../circuit/ops";
import { Device } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import { Props } from "../../circuit/props";
import { Unit } from "../../util/unit";
import { Temp } from "../const";
import { BjtPolarity, bjtSign, npn, PN, pnp } from "./semi";

export interface BjtProps {
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
export class Bjt extends Device<BjtProps, BjtState> {
  static override readonly id = "BJT";
  static override readonly numTerminals = 3;
  static override readonly propsSchema = {
    polarity: Props.enum({
      values: [npn, pnp],
      title: "transistor polarity",
    }),
    Temp: Props.number({
      default: Temp,
      title: "device temperature",
    }),
    Is: Props.number({
      default: 1e-14,
      title: "saturation current",
    }),
    Nf: Props.number({
      default: 1,
      title: "forward emission coefficient",
    }),
    Nr: Props.number({
      default: 1,
      title: "reverse emission coefficient",
    }),
    Vaf: Props.number({
      default: 10,
      title: "forward Early voltage",
    }),
    Var: Props.number({
      default: 0,
      title: "reverse Early voltage",
    }),
    Bf: Props.number({
      default: 100,
      title: "forward beta",
    }),
    Br: Props.number({
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

  constructor(name: string, [ne, nb, nc]: readonly Node[], props: BjtProps) {
    super(name, [ne, nb, nc], props);
    this.ne = ne;
    this.nb = nb;
    this.nc = nc;
    const { Temp, Is, Nf, Nr } = this.props;
    this.pnBe = new PN(Temp, Is, Nf);
    this.pnBc = new PN(Temp, Is, Nr);
  }

  override getInitialState(): BjtState {
    return { prevVbe: 0, prevVbc: 0 };
  }

  override stamp(stamper: Stamper, state: BjtState): void {
    const { props, ne, nb, nc, pnBe, pnBc } = this;
    const { polarity, Bf, Br } = props;
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
    const { props, ne, nb, nc, pnBe, pnBc } = this;
    const { polarity, Bf, Br } = props;
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
