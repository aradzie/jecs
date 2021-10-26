import type { Op } from "../../circuit/ops";
import { Device } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import { Params } from "../../circuit/params";
import { Unit } from "../../util/unit";
import { Temp } from "../const";
import { PN } from "./semi";

export interface DiodeParams {
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
export class Diode extends Device<DiodeParams, DiodeState> {
  static override readonly id = "Diode";
  static override readonly numTerminals = 2;
  static override readonly paramsSchema = {
    Temp: Params.number({
      default: Temp,
      title: "device temperature",
    }),
    Is: Params.number({
      default: 1e-14,
      title: "saturation current",
    }),
    N: Params.number({
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

  constructor(name: string, [na, nc]: readonly Node[], params: DiodeParams) {
    super(name, [na, nc], params);
    this.na = na;
    this.nc = nc;
    const { Temp, Is, N } = this.params;
    this.pn = new PN(Temp, Is, N);
  }

  override getInitialState(): DiodeState {
    return { prevVd: 0 };
  }

  override stamp(stamper: Stamper, state: DiodeState): void {
    const { na, nc, pn } = this;
    const Vd0 = na.voltage - nc.voltage;
    const Vd = (state.prevVd = pn.limitVoltage(Vd0, state.prevVd));
    pn.stamp(stamper, na, nc, Vd);
  }

  override ops(): readonly Op[] {
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
