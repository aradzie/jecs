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
  /** Jfet source-drain voltage. */
  Vsd,
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

  override eval(state: DeviceState): void {
    const { ns, ng, nd, params, pnGs, pnGd } = this;
    const { polarity, Vth, beta, lambda } = params;
    const sign = fetSign(polarity);

    const Vgs = (state[S.Vgs] = pnGs.limitVoltage(sign * (ng.voltage - ns.voltage), state[S.Vgs]));
    const Vgd = (state[S.Vgd] = pnGd.limitVoltage(sign * (ng.voltage - nd.voltage), state[S.Vgd]));

    // DIODES

    state[S.Igs] = pnGs.evalCurrent(Vgs);
    state[S.Ggs] = pnGs.evalConductance(Vgs);

    state[S.Igd] = pnGs.evalCurrent(Vgd);
    state[S.Ggd] = pnGs.evalConductance(Vgd);

    // FET

    const Vds = (state[S.Vds] = Vgs - Vgd);
    const Vsd = (state[S.Vsd] = Vgd - Vgs);

    if (Vgs >= Vgd) {
      // Normal mode.
      const Vgst = Vgs - Vth;
      if (Vgst <= 0) {
        // Cutoff region.
        state[S.Ids] = 0;
        state[S.Gds] = 0;
        state[S.Gm] = 0;
      } else {
        const c0 = lambda * Vds;
        const c1 = beta * (1 + c0);
        if (Vgst <= Vds) {
          // Saturation region.
          state[S.Ids] = c1 * Vgst * Vgst;
          state[S.Gds] = beta * lambda * Vgst * Vgst;
          state[S.Gm] = 2 * c1 * Vgst;
        } else {
          // Linear region.
          state[S.Ids] = c1 * Vds * (2 * Vgst - Vds);
          state[S.Gds] = 2 * c1 * (Vgst - Vds) + beta * c0 * (2 * Vgst - Vds);
          state[S.Gm] = 2 * c1 * Vds;
        }
      }
    } else {
      // Inverse mode.
      const Vgdt = Vgd - Vth;
      if (Vgdt <= 0) {
        // Cutoff region.
        state[S.Ids] = 0;
        state[S.Gds] = 0;
        state[S.Gm] = 0;
      } else {
        const c0 = lambda * Vsd;
        const c1 = beta * (1 + c0);
        if (Vgdt <= Vsd) {
          // Saturation region.
          state[S.Ids] = -c1 * Vgdt * Vgdt;
          state[S.Gds] = beta * lambda * Vgdt * Vgdt + 2 * c1 * Vgdt;
          state[S.Gm] = -2 * c1 * Vgdt;
        } else {
          // Linear region.
          state[S.Ids] = -c1 * Vsd * (2 * Vgdt - Vsd);
          state[S.Gds] = 2 * c1 * Vgdt + beta * c0 * (2 * Vgdt - Vsd);
          state[S.Gm] = -2 * c1 * Vsd;
        }
      }
    }
  }

  override stamp(
    stamper: Stamper,
    [Vgs, Igs, Ggs, Vgd, Igd, Ggd, Vds, Vsd, Ids, Gds, Gm]: DeviceState,
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
    [VgsX, Igs, Ggs, VgdX, Igd, Ggd, VdsX, VsdX, Ids, Gds, Gm]: DeviceState = this.state,
  ): readonly Op[] {
    const { ns, ng, nd, params } = this;
    const { polarity } = params;
    const sign = fetSign(polarity);
    const Vgs = sign * (ng.voltage - ns.voltage);
    const Vgd = sign * (ng.voltage - nd.voltage);
    const Vds = sign * (nd.voltage - ns.voltage);
    return [
      { name: "Vgs", value: sign * Vgs, unit: Unit.VOLT },
      { name: "Vgd", value: sign * Vgd, unit: Unit.VOLT },
      { name: "Vds", value: sign * Vds, unit: Unit.VOLT },
      { name: "Ids", value: sign * Ids, unit: Unit.AMPERE },
    ];
  }
}
