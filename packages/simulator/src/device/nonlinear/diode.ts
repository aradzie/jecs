import type { Details } from "../../circuit/details";
import { Device } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import { Props } from "../../circuit/props";
import { Unit } from "../../util/unit";
import { Temp } from "../const";
import { PN } from "./semi";

export interface DiodeProps {
  readonly Temp: number;
  readonly Is: number;
  readonly N: number;
}

interface DiodeState {
  prevVd: number;
}

/**
 * Diode.
 */
export class Diode extends Device<DiodeProps, DiodeState> {
  static override readonly id = "Diode";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = {
    Temp: Props.number({
      default: Temp,
      title: "device temperature",
    }),
    Is: Props.number({
      default: 1e-14,
      title: "saturation current",
    }),
    N: Props.number({
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
    const { Temp, Is, N } = this.props;
    this.pn = new PN(Temp, Is, N);
  }

  override getInitialState(): DiodeState {
    return { prevVd: 0 };
  }

  override stamp(stamper: Stamper, state: DiodeState): void {
    const { na, nc, pn } = this;
    const Vd = (state.prevVd = pn.limitVoltage(
      na.voltage - nc.voltage,
      state.prevVd,
    ));
    const eqGd = pn.evalConductance(Vd);
    const eqId = pn.evalCurrent(Vd) - eqGd * Vd;
    stamper.stampConductance(na, nc, eqGd);
    stamper.stampCurrentSource(na, nc, eqId);
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