import type { Details } from "../circuit/details";
import { Device } from "../circuit/device";
import type { Node, Stamper } from "../circuit/network";
import { Props } from "../circuit/props";
import { Unit } from "../util/unit";
import { Temp } from "./const";

const nfet = "nfet" as const;
const pfet = "pfet" as const;

export interface MosFetProps {
  readonly polarity: typeof nfet | typeof pfet;
  readonly Temp: number;
  readonly Vth: number;
  readonly beta: number;
  readonly lambda: number;
}

/**
 * Metal–oxide–semiconductor field-effect transistor, MOSFET.
 */
export class MosFet extends Device<MosFetProps> {
  static override readonly id = "MOSFET";
  static override readonly numTerminals = 3;
  static override readonly propsSchema = {
    polarity: Props.enum({
      values: [nfet, pfet],
      title: "transistor polarity",
    }),
    Temp: Props.number({
      default: Temp,
      title: "device temperature",
    }),
    Vth: Props.number({
      default: 2,
      title: "threshold voltage",
    }),
    beta: Props.number({
      default: 0.02,
      title: "transconductance parameter",
    }),
    lambda: Props.number({
      default: 0,
      title: "channel-length modulation parameter",
    }),
  };

  /** The drain terminal. */
  readonly nd: Node;
  /** The gate terminal. */
  readonly ng: Node;
  /** The source terminal. */
  readonly ns: Node;

  constructor(name: string, [nd, ng, ns]: readonly Node[], props: MosFetProps) {
    super(name, [nd, ng, ns], props);
    this.nd = nd;
    this.ng = ng;
    this.ns = ns;
  }

  override stamp(stamper: Stamper): void {
    const { nd, ng, ns, props } = this;
    const { polarity, Vth, beta, lambda } = props;
    const sign = polaritySign(polarity); // TODO
    const Vds = nd.voltage - ns.voltage;
    const Vgs = ng.voltage - ns.voltage;
    let Ids;
    let eqGds;
    let eqGm;
    const Vx = Vgs - Vth;
    if (Vds > 0) {
      // TODO
    } else {
      // TODO
    }
    if (Vx < 0) {
      // cut-off
      Ids = 0;
      eqGds = 0;
      eqGm = 0;
    } else {
      const c0 = lambda * Vds;
      const c1 = 1 + c0;
      if (Vds < Vx) {
        // linear
        Ids = beta * c1 * Vds * (Vx - Vds / 2);
        eqGds = beta * c1 * (Vx - Vds) + beta * c0 * (Vx - Vds / 2);
        eqGm = beta * c1 * Vds;
      } else {
        // saturation
        Ids = (beta / 2) * c1 * Vx * Vx;
        eqGds = (beta / 2) * lambda * Vx * Vx;
        eqGm = beta * c1 * Vx;
      }
    }
    const eqIds = Ids - eqGds * Vds - eqGm * Vgs;
    stamper.stampMatrix(nd, nd, eqGds);
    stamper.stampMatrix(nd, ns, -(eqGds + eqGm));
    stamper.stampMatrix(nd, ng, eqGm);
    stamper.stampRightSide(nd, -eqIds);
    stamper.stampMatrix(ns, nd, -eqGds);
    stamper.stampMatrix(ns, ns, eqGds + eqGm);
    stamper.stampMatrix(ns, ng, -eqGm);
    stamper.stampRightSide(ns, eqIds);
  }

  override details(): Details {
    const { nd, ng, ns, props } = this;
    const { polarity, Vth, beta, lambda } = props;
    const sign = polaritySign(polarity); // TODO
    const Vds = nd.voltage - ns.voltage;
    const Vgs = ng.voltage - ns.voltage;
    let Ids;
    const Vx = Vgs - Vth;
    if (Vds > 0) {
      // TODO
    } else {
      // TODO
    }
    if (Vx < 0) {
      // cut-off
      Ids = 0;
    } else {
      const c0 = lambda * Vds;
      const c1 = 1 + c0;
      if (Vds < Vx) {
        // linear
        Ids = beta * c1 * Vds * (Vx - Vds / 2);
      } else {
        // saturation
        Ids = (beta / 2) * c1 * Vx * Vx;
      }
    }
    return [
      { name: "Vds", value: Vds, unit: Unit.VOLT },
      { name: "Vgs", value: Vgs, unit: Unit.VOLT },
      { name: "Ids", value: Ids, unit: Unit.AMPERE },
    ];
  }
}

function polaritySign(polarity: string): number {
  switch (polarity) {
    case nfet:
      return 1;
    case pfet:
      return -1;
  }
  throw new TypeError();
}
