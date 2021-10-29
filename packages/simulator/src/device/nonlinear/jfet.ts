import { Device } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params } from "../../circuit/params";
import { Unit } from "../../util/unit";
import { Temp } from "../const";
import { FetPolarity, fetSign, nfet, pfet, PN } from "./semi";

export interface JfetParams {
  readonly polarity: FetPolarity;
  readonly Vth: number;
  readonly beta: number;
  readonly lambda: number;
  readonly Is: number;
  readonly N: number;
  readonly Temp: number;
}

interface JfetState {
  /** Gate-source diode voltage. */
  Vgs: number;
  /** Gate-source diode current. */
  Igs: number;
  /** Gate-source diode conductance. */
  Ggs: number;
  /** Gate-drain diode voltage. */
  Vgd: number;
  /** Gate-drain diode current. */
  Igd: number;
  /** Gate-drain diode conductance. */
  Ggd: number;
  /** Jfet drain-source voltage. */
  Vds: number;
  /** Jfet source-drain voltage. */
  Vsd: number;
  /** Jfet drain-source current. */
  Ids: number;
  /** Jfet drain-source conductance. */
  Gds: number;
  /** Jfet transconductance. */
  Gm: number;
}

/**
 * Junction field-effect transistor, JFET.
 */
export class Jfet extends Device<JfetParams, JfetState> {
  static modelNJfet = Object.freeze<JfetParams>({
    polarity: "nfet",
    Vth: -2.0,
    beta: 1e-4,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  });
  static modelPJfet = Object.freeze<JfetParams>({
    polarity: "pfet",
    Vth: -2.0,
    beta: 1e-4,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  });

  static override readonly id = "JFET";
  static override readonly numTerminals = 3;
  static override readonly paramsSchema = {
    polarity: Params.enum({
      values: [nfet, pfet],
      title: "transistor polarity",
    }),
    Vth: Params.number({
      default: -4,
      title: "threshold voltage",
    }),
    beta: Params.number({
      default: 0.00125,
      title: "transconductance parameter",
    }),
    lambda: Params.number({
      default: 0,
      title: "channel-length modulation parameter",
    }),
    Is: Params.number({
      default: 1e-14,
      title: "saturation current",
    }),
    N: Params.number({
      default: 1,
      title: "emission coefficient",
    }),
    Temp: Params.number({
      default: Temp,
      title: "device temperature",
    }),
  };

  /** The source terminal. */
  readonly ns: Node;
  /** The gate terminal. */
  readonly ng: Node;
  /** The drain terminal. */
  readonly nd: Node;
  /** The gate-source PN junction of JFET. */
  private readonly pnGs: PN;
  /** The gate-drain PN junction of JFET. */
  private readonly pnGd: PN;

  constructor(name: string, [ns, ng, nd]: readonly Node[], params: JfetParams) {
    super(name, [ns, ng, nd], params);
    this.ns = ns;
    this.ng = ng;
    this.nd = nd;
    const { Is, N, Temp } = this.params;
    this.pnGs = new PN(Is, N, Temp);
    this.pnGd = new PN(Is, N, Temp);
  }

  override getInitialState(): JfetState {
    return {
      Vgs: 0,
      Igs: 0,
      Ggs: 0,
      Vgd: 0,
      Igd: 0,
      Ggd: 0,
      Vds: 0,
      Vsd: 0,
      Ids: 0,
      Gds: 0,
      Gm: 0,
    };
  }

  override eval(state: JfetState): void {
    const { ns, ng, nd, params, pnGs, pnGd } = this;
    const { polarity, Vth, beta, lambda } = params;
    const sign = fetSign(polarity);

    const Vgs = (state.Vgs = pnGs.limitVoltage(
      sign * (ng.voltage - ns.voltage),
      state.Vgs,
    ));
    const Vgd = (state.Vgd = pnGd.limitVoltage(
      sign * (ng.voltage - nd.voltage),
      state.Vgd,
    ));

    // DIODES

    state.Igs = pnGs.evalCurrent(Vgs);
    state.Ggs = pnGs.evalConductance(Vgs);

    state.Igd = pnGs.evalCurrent(Vgd);
    state.Ggd = pnGs.evalConductance(Vgd);

    // FET

    const Vds = (state.Vds = Vgs - Vgd);
    const Vsd = (state.Vsd = Vgd - Vgs);

    if (Vgs >= Vgd) {
      // Normal mode.
      const Vgst = Vgs - Vth;
      if (Vgst <= 0) {
        // Cutoff region.
        state.Ids = 0;
        state.Gds = 0;
        state.Gm = 0;
      } else {
        const c0 = lambda * Vds;
        const c1 = beta * (1 + c0);
        if (Vgst <= Vds) {
          // Saturation region.
          state.Ids = c1 * Vgst * Vgst;
          state.Gds = beta * lambda * Vgst * Vgst;
          state.Gm = 2 * c1 * Vgst;
        } else {
          // Linear region.
          state.Ids = c1 * Vds * (2 * Vgst - Vds);
          state.Gds = 2 * c1 * (Vgst - Vds) + beta * c0 * (2 * Vgst - Vds);
          state.Gm = 2 * c1 * Vds;
        }
      }
    } else {
      // Inverse mode.
      const Vgdt = Vgd - Vth;
      if (Vgdt <= 0) {
        // Cutoff region.
        state.Ids = 0;
        state.Gds = 0;
        state.Gm = 0;
      } else {
        const c0 = lambda * Vsd;
        const c1 = beta * (1 + c0);
        if (Vgdt <= Vsd) {
          // Saturation region.
          state.Ids = -c1 * Vgdt * Vgdt;
          state.Gds = beta * lambda * Vgdt * Vgdt + 2 * c1 * Vgdt;
          state.Gm = -2 * c1 * Vgdt;
        } else {
          // Linear region.
          state.Ids = -c1 * Vsd * (2 * Vgdt - Vsd);
          state.Gds = 2 * c1 * Vgdt + beta * c0 * (2 * Vgdt - Vsd);
          state.Gm = -2 * c1 * Vsd;
        }
      }
    }
  }

  override stamp(
    stamper: Stamper,
    {
      Vgs,
      Igs,
      Ggs,
      Vgd,
      Igd,
      Ggd,
      Vds,
      Vsd,
      Ids,
      Gds,
      Gm, //
    }: JfetState,
  ): void {
    const { ns, ng, nd, params } = this;
    const { polarity } = params;
    const sign = fetSign(polarity);

    // DIODES

    stamper.stampConductance(ng, ns, Ggs);
    stamper.stampCurrentSource(ng, ns, sign * (Igs - Ggs * Vgs));

    stamper.stampConductance(ng, nd, Ggd);
    stamper.stampCurrentSource(ng, nd, sign * (Igd - Ggd * Vgd));

    // FET

    stamper.stampConductance(nd, ns, Gds);
    stamper.stampMatrix(nd, ng, Gm);
    stamper.stampMatrix(nd, ns, -Gm);
    stamper.stampMatrix(ns, ng, -Gm);
    stamper.stampMatrix(ns, ns, Gm);
    stamper.stampCurrentSource(nd, ns, sign * (Ids - Gds * Vds - Gm * Vgs));
  }

  override ops(
    {
      Vgs,
      Igs,
      Ggs,
      Vgd,
      Igd,
      Ggd,
      Vds,
      Vsd,
      Ids,
      Gds,
      Gm, //
    }: JfetState = this.state,
  ): readonly Op[] {
    const { params } = this;
    const { polarity } = params;
    const sign = fetSign(polarity);
    return [
      { name: "Vgs", value: sign * Vgs, unit: Unit.VOLT },
      { name: "Vds", value: sign * Vds, unit: Unit.VOLT },
      { name: "Ids", value: sign * Ids, unit: Unit.AMPERE },
    ];
  }
}
