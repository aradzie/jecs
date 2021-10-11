import type { Details } from "../circuit/details";
import { Device } from "../circuit/device";
import type { Node, Stamper } from "../circuit/network";
import type { DeviceProps } from "../circuit/props";
import { Unit } from "../util/unit";
import { PN } from "./semi";

export interface BjtProps extends DeviceProps {
  readonly T: number;
  readonly Is: number;
  readonly Nf: number;
  readonly Nr: number;
  readonly Vaf: number;
  readonly Var: number;
  readonly Ise: number;
  readonly Ne: number;
  readonly Isc: number;
  readonly Nc: number;
  readonly Bf: number;
  readonly Br: number;
  readonly area: number;
}

interface BjtState {
  prevVbe: number;
  prevVbc: number;
}

/**
 * Bipolar junction transistor.
 */
export class Bjt extends Device<BjtProps, BjtState> {
  static override readonly id = "Bjt";
  static override readonly numTerminals = 3;
  static override readonly propsSchema = [
    {
      name: "T",
      unit: Unit.KELVIN,
      default: 3.0015e2,
      title: "device temperature",
    },
    {
      name: "Is",
      unit: Unit.AMPERE,
      default: 1e-14,
      title: "saturation current",
    },
    {
      name: "Nf",
      unit: Unit.UNITLESS,
      default: 1,
      title: "forward emission coefficient",
    },
    {
      name: "Nr",
      unit: Unit.UNITLESS,
      default: 1,
      title: "reverse emission coefficient",
    },
    {
      name: "Vaf",
      unit: Unit.VOLT,
      default: 10,
      title: "forward Early voltage",
    },
    {
      name: "Var",
      unit: Unit.VOLT,
      default: 0,
      title: "reverse Early voltage",
    },
    {
      name: "Ise",
      unit: Unit.AMPERE,
      default: 0,
      title: "base-emitter leakage saturation current",
    },
    {
      name: "Ne",
      unit: Unit.UNITLESS,
      default: 1.5,
      title: "base-emitter leakage emission coefficient",
    },
    {
      name: "Isc",
      unit: Unit.AMPERE,
      default: 0,
      title: "base-collector leakage saturation current",
    },
    {
      name: "Nc",
      unit: Unit.UNITLESS,
      default: 2,
      title: "base-collector leakage emission coefficient",
    },
    { name: "Bf", unit: Unit.UNITLESS, default: 100, title: "forward beta" },
    { name: "Br", unit: Unit.UNITLESS, default: 1, title: "reverse beta" },
    { name: "area", unit: Unit.UNITLESS, default: 1, title: "transistor area" },
  ];

  /** Emitter terminal. */
  readonly ne: Node;
  /** Base terminal. */
  readonly nb: Node;
  /** Collector terminal. */
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
    this.pnBe = new PN(this.props.T, this.props.Is, this.props.area);
    this.pnBc = new PN(this.props.T, this.props.Is, this.props.area);
  }

  override getInitialState(): BjtState {
    return { prevVbe: 0, prevVbc: 0 };
  }

  override stamp(stamper: Stamper, state: BjtState): void {
    const { props, ne, nb, nc, pnBe, pnBc } = this;
    const { Bf, Br } = props;
    const Af = Bf / (Bf + 1);
    const Ar = Br / (Br + 1);
    const Vbe = (state.prevVbe = pnBe.limitVoltage(
      nb.voltage - ne.voltage,
      state.prevVbe,
    ));
    const Vbc = (state.prevVbc = pnBc.limitVoltage(
      nb.voltage - nc.voltage,
      state.prevVbc,
    ));
    const If = pnBe.evalCurrent(Vbe);
    const Ir = pnBc.evalCurrent(Vbc);
    const Ie = Ar * Ir - If;
    const Ic = Af * If - Ir;
    const eqGee = pnBe.evalConductance(Vbe);
    const eqGec = Ar * pnBc.evalConductance(Vbc);
    const eqGce = Af * pnBe.evalConductance(Vbe);
    const eqGcc = pnBc.evalConductance(Vbc);
    const eqIe = Ie + eqGee * Vbe - eqGec * Vbc;
    const eqIc = Ic - eqGce * Vbe + eqGcc * Vbc;
    stamper.stampMatrix(ne, ne, eqGee);
    stamper.stampMatrix(ne, nc, -eqGec);
    stamper.stampMatrix(ne, nb, eqGec - eqGee);
    stamper.stampRightSide(ne, -eqIe);
    stamper.stampMatrix(nc, ne, -eqGce);
    stamper.stampMatrix(nc, nc, eqGcc);
    stamper.stampMatrix(nc, nb, eqGce - eqGcc);
    stamper.stampRightSide(nc, -eqIc);
    stamper.stampMatrix(nb, ne, eqGce - eqGee);
    stamper.stampMatrix(nb, nc, eqGec - eqGcc);
    stamper.stampMatrix(nb, nb, eqGcc + eqGee - eqGce - eqGec);
    stamper.stampRightSide(nb, eqIe + eqIc);
  }

  override details(): Details {
    const { props, ne, nb, nc, pnBe, pnBc } = this;
    const { Bf, Br } = props;
    const Af = Bf / (Bf + 1);
    const Ar = Br / (Br + 1);
    const Vbe = nb.voltage - ne.voltage;
    const Vbc = nb.voltage - nc.voltage;
    const Vce = nc.voltage - ne.voltage;
    const If = pnBe.evalCurrent(Vbe);
    const Ir = pnBc.evalCurrent(Vbc);
    const Ie = Ar * Ir - If;
    const Ic = Af * If - Ir;
    const Ib = -(Ie + Ic);
    return [
      { name: "Vbe", value: Vbe, unit: Unit.VOLT },
      { name: "Vbc", value: Vbc, unit: Unit.VOLT },
      { name: "Vce", value: Vce, unit: Unit.VOLT },
      { name: "Ie", value: Ie, unit: Unit.AMPERE },
      { name: "Ic", value: Ic, unit: Unit.AMPERE },
      { name: "Ib", value: Ib, unit: Unit.AMPERE },
    ];
  }
}