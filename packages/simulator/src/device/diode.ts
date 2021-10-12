import type { Details } from "../circuit/details";
import { Device } from "../circuit/device";
import type { Node, Stamper } from "../circuit/network";
import { Props } from "../circuit/props";
import { Unit } from "../util/unit";
import { PN } from "./semi";

export interface DiodeProps {
  readonly T: number;
  readonly Is: number;
  readonly N: number;
}

interface DiodeState {
  prevVoltage: number;
}

/**
 * Diode.
 */
export class Diode extends Device<DiodeProps, DiodeState> {
  static override readonly id = "Diode";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = {
    T: Props.number({
      unit: Unit.KELVIN,
      default: 3.0015e2,
      title: "device temperature",
    }),
    Is: Props.number({
      unit: Unit.AMPERE,
      default: 1e-14,
      title: "saturation current",
    }),
    N: Props.number({
      unit: Unit.UNITLESS,
      default: 1,
      title: "emission coefficient",
    }),
  };

  /** The anode terminal. */
  readonly na: Node;
  /** The cathode terminal. */
  readonly nc: Node;
  /** The PN junction of diode. */
  readonly pn: PN;

  constructor(name: string, [na, nc]: readonly Node[], props: DiodeProps) {
    super(name, [na, nc], props);
    this.na = na;
    this.nc = nc;
    this.pn = new PN(this.props.T, this.props.Is, this.props.N);
  }

  override getInitialState(): DiodeState {
    return { prevVoltage: 0 };
  }

  override stamp(stamper: Stamper, state: DiodeState): void {
    const { na, nc, pn } = this;
    const voltage = (state.prevVoltage = pn.limitVoltage(
      na.voltage - nc.voltage,
      state.prevVoltage,
    ));
    const eqG = pn.evalConductance(voltage);
    const eqI = pn.evalCurrent(voltage) - eqG * voltage;
    stamper.stampConductance(na, nc, eqG);
    stamper.stampCurrentSource(na, nc, eqI);
  }

  override details(): Details {
    const { na, nc, pn } = this;
    const voltage = na.voltage - nc.voltage;
    const current = pn.evalCurrent(voltage);
    const power = voltage * current;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
