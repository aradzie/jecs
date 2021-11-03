import { Device, DeviceState, StateParams } from "../../circuit/device";
import type { DeviceModel } from "../../circuit/library";
import type { Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params, ParamsSchema } from "../../circuit/params";
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

const enum S {
  /** Gate-source diode voltage. */
  Vgs,
  /** Gate-source diode current. */
  Igs,
  /** Gate-source diode conductance. */
  Ggs,
  /** Gate-drain diode voltage. */
  Vgd,
  /** Gate-drain diode current. */
  Igd,
  /** Gate-drain diode conductance. */
  Ggd,
  /** Jfet drain-source voltage. */
  Vds,
  /** Jfet drain-source current. */
  Ids,
  /** Jfet drain-source conductance. */
  Gds,
  /** Jfet transconductance. */
  Gm,
  _Size_,
}

/**
 * Junction field-effect transistor, JFET.
 */
export class Jfet extends Device<JfetParams> {
  static override getModels(): readonly DeviceModel[] {
    return [
      ["NFET", Jfet.modelNJfet],
      ["PFET", Jfet.modelPJfet],
    ];
  }

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
  static override readonly paramsSchema: ParamsSchema<JfetParams> = {
    polarity: Params.enum({
      values: [nfet, pfet],
      title: "transistor polarity",
    }),
    Vth: Params.number({
      default: -2.0,
      min: -100,
      max: +100,
      title: "threshold voltage",
    }),
    beta: Params.number({
      default: 1e-4,
      min: 1e-6,
      title: "transconductance parameter",
    }),
    lambda: Params.number({
      default: 0.0,
      min: 0,
      title: "channel-length modulation parameter",
    }),
    Is: Params.number({
      default: 1e-14,
      min: 0,
      title: "saturation current",
    }),
    N: Params.number({
      default: 1,
      min: 1e-3,
      max: 100,
      title: "emission coefficient",
    }),
    Temp: Params.Temp,
  };
  static override readonly stateParams: StateParams = {
    length: S._Size_,
    outputs: [
      { index: S.Vgs, name: "Vgs", unit: "V" },
      { index: S.Vgd, name: "Vgd", unit: "V" },
      { index: S.Vds, name: "Vds", unit: "V" },
      { index: S.Ids, name: "Ids", unit: "A" },
      { index: S.Gm, name: "gm", unit: "A/V" },
    ],
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

  constructor(id: string, [ns, ng, nd]: readonly Node[], params: JfetParams) {
    super(id, [ns, ng, nd], params);
    this.ns = ns;
    this.ng = ng;
    this.nd = nd;
    const { Is, N, Temp } = this.params;
    this.pnGs = new PN(Is, N, Temp);
    this.pnGd = new PN(Is, N, Temp);
  }

  override eval(state: DeviceState, final: boolean): void {
    const { params, ns, ng, nd, pnGs, pnGd } = this;
    const { polarity, Vth, beta, lambda } = params;
    const pol = fetSign(polarity);

    // VOLTAGES

    let Vgs = pol * (ng.voltage - ns.voltage);
    let Vgd = pol * (ng.voltage - nd.voltage);
    if (!final) {
      Vgs = pnGs.limitVoltage(Vgs, pol * state[S.Vgs]);
      Vgd = pnGd.limitVoltage(Vgd, pol * state[S.Vgd]);
    }
    const Vds = Vgs - Vgd;

    // DIODES

    const Igs = pnGs.evalCurrent(Vgs);
    const Ggs = pnGs.evalConductance(Vgs);
    const Igd = pnGs.evalCurrent(Vgd);
    const Ggd = pnGs.evalConductance(Vgd);

    // FET

    let Ids;
    let Gds;
    let Gm;
    if (Vgs >= Vgd) {
      // Normal mode.
      const Vgst = Vgs - Vth;
      if (Vgst <= 0) {
        // Cutoff region.
        Ids = 0;
        Gds = 0;
        Gm = 0;
      } else {
        const c0 = lambda * Vds;
        const c1 = beta * (1 + c0);
        if (Vgst <= Vds) {
          // Saturation region.
          Ids = c1 * Vgst * Vgst;
          Gds = beta * lambda * Vgst * Vgst;
          Gm = 2 * c1 * Vgst;
        } else {
          // Linear region.
          Ids = c1 * Vds * (2 * Vgst - Vds);
          Gds = 2 * c1 * (Vgst - Vds) + beta * c0 * (2 * Vgst - Vds);
          Gm = 2 * c1 * Vds;
        }
      }
    } else {
      // Inverse mode.
      const Vgdt = Vgd - Vth;
      if (Vgdt <= 0) {
        // Cutoff region.
        Ids = 0;
        Gds = 0;
        Gm = 0;
      } else {
        const Vsd = -Vds;
        const c0 = lambda * Vsd;
        const c1 = beta * (1 + c0);
        if (Vgdt <= Vsd) {
          // Saturation region.
          Ids = -c1 * Vgdt * Vgdt;
          Gds = beta * lambda * Vgdt * Vgdt + 2 * c1 * Vgdt;
          Gm = -2 * c1 * Vgdt;
        } else {
          // Linear region.
          Ids = -c1 * Vsd * (2 * Vgdt - Vsd);
          Gds = 2 * c1 * Vgdt + beta * c0 * (2 * Vgdt - Vsd);
          Gm = -2 * c1 * Vsd;
        }
      }
    }

    // VOLTAGES

    state[S.Vgs] = pol * Vgs;
    state[S.Vgd] = pol * Vgd;
    state[S.Vds] = pol * Vds;

    // DIODES

    state[S.Igs] = pol * Igs;
    state[S.Ggs] = Ggs;
    state[S.Igd] = pol * Igd;
    state[S.Ggd] = Ggd;

    // FET

    state[S.Ids] = pol * Ids;
    state[S.Gds] = Gds;
    state[S.Gm] = Gm;
  }

  override stamp(
    stamper: Stamper,
    [Vgs, Igs, Ggs, Vgd, Igd, Ggd, Vds, Ids, Gds, Gm]: DeviceState,
  ): void {
    const { ns, ng, nd, params } = this;
    const { polarity } = params;
    const pol = fetSign(polarity);

    // DIODES

    stamper.stampConductance(ng, ns, Ggs);
    stamper.stampCurrentSource(ng, ns, pol * (pol * Igs - pol * Ggs * Vgs));

    stamper.stampConductance(ng, nd, Ggd);
    stamper.stampCurrentSource(ng, nd, pol * (pol * Igd - pol * Ggd * Vgd));

    // FET

    stamper.stampConductance(nd, ns, Gds);
    stamper.stampMatrix(nd, ng, Gm);
    stamper.stampMatrix(nd, ns, -Gm);
    stamper.stampMatrix(ns, ng, -Gm);
    stamper.stampMatrix(ns, ns, Gm);
    stamper.stampCurrentSource(nd, ns, pol * (pol * Ids - pol * Gds * Vds - pol * Gm * Vgs));
  }

  override ops(
    [Vgs, Igs, Ggs, Vgd, Igd, Ggd, Vds, Ids, Gds, Gm]: DeviceState = this.state,
  ): readonly Op[] {
    return [
      { name: "Vgs", value: Vgs, unit: Unit.VOLT },
      { name: "Vgd", value: Vgd, unit: Unit.VOLT },
      { name: "Vds", value: Vds, unit: Unit.VOLT },
      { name: "Ids", value: Ids, unit: Unit.AMPERE },
    ];
  }
}
