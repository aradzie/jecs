import type { Details } from "../circuit/details";
import { Device } from "../circuit/device";
import type { Node, Stamper } from "../circuit/network";
import type { DeviceProps } from "../circuit/props";
import { Unit } from "../util/unit";
import { PN } from "./semi";

export interface BjtProps extends DeviceProps {
  /** The temperature, `K`. */
  readonly T: number;
  /** The reverse bias saturation current, `A`. */
  readonly Is: number;
  /** The forward emission coefficient. */
  readonly Nf: number;
  /** The reverse emission coefficient. */
  readonly Nr: number;
  /** The forward Early voltage, `V`. */
  readonly Vaf: number;
  /** The reverse Early voltage, `V`. */
  readonly Var: number;
  /** The base-emitter leakage saturation current, `A`. */
  readonly Ise: number;
  /** The base-emitter leakage emission coefficient. */
  readonly Ne: number;
  /** The base-collector leakage saturation current, `A`. */
  readonly Isc: number;
  /** The base-collector leakage emission coefficient. */
  readonly Nc: number;
  /** The forward beta. */
  readonly Bf: number;
  /** The reverse beta. */
  readonly Br: number;
  /** The default area. */
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
    { name: "T", unit: Unit.KELVIN, default: 3.0015e2 },
    { name: "Is", unit: Unit.AMPERE, default: 1e-14 },
    { name: "Nf", unit: Unit.UNITLESS, default: 1 },
    { name: "Nr", unit: Unit.UNITLESS, default: 1 },
    { name: "Vaf", unit: Unit.VOLT, default: 10 },
    { name: "Var", unit: Unit.VOLT, default: 0 },
    { name: "Ise", unit: Unit.AMPERE, default: 0 },
    { name: "Ne", unit: Unit.UNITLESS, default: 1.5 },
    { name: "Isc", unit: Unit.AMPERE, default: 0 },
    { name: "Nc", unit: Unit.UNITLESS, default: 2 },
    { name: "Bf", unit: Unit.UNITLESS, default: 100 },
    { name: "Br", unit: Unit.UNITLESS, default: 1 },
    { name: "area", unit: Unit.UNITLESS, default: 1 },
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
