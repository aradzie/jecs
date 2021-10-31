import { Device } from "../../circuit/device";
import type { DeviceModel } from "../../circuit/library";
import type { Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params, ParamsSchema } from "../../circuit/params";
import { Unit } from "../../util/unit";
import { Temp } from "../const";
import { FetPolarity, fetSign, limitMosfetVoltage, nfet, pfet, PN } from "./semi";

export interface MosfetParams {
  readonly polarity: FetPolarity;
  readonly Vth: number;
  readonly beta: number;
  readonly lambda: number;
  readonly Is: number;
  readonly N: number;
  readonly Temp: number;
}

const enum S {
  /** Bulk-source diode voltage. */
  Vbs,
  /** Bulk-source diode current. */
  Ibs,
  /** Bulk-source diode conductance. */
  Gbs,
  /** Bulk-drain diode voltage. */
  Vbd,
  /** Bulk-drain diode current. */
  Ibd,
  /** Bulk-drain diode conductance. */
  Gbd,
  /** Mosfet gate-source voltage. */
  Vgs,
  /** Mosfet gate-drain voltage. */
  Vgd,
  /** Mosfet drain-source voltage. */
  Vds,
  /** Mosfet drain-source current. */
  Ids,
  /** Mosfet drain-source conductance. */
  Gds,
  /** Mosfet transconductance. */
  Gm,
  _Size_,
}

/**
 * Metal–oxide–semiconductor field-effect transistor, MOSFET.
 */
export class Mosfet extends Device<MosfetParams, Float64Array> {
  static override getModels(): readonly DeviceModel[] {
    return [
      ["NMOS", Mosfet.modelEnhNMosfet],
      ["PMOS", Mosfet.modelEnhPMosfet],
      ["DEPNMOS", Mosfet.modelDepNMosfet],
      ["DEPPMOS", Mosfet.modelDepPMosfet],
    ];
  }

  static modelEnhNMosfet = Object.freeze<MosfetParams>({
    polarity: "nfet",
    Vth: +2.0,
    beta: 2e-2,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  });
  static modelEnhPMosfet = Object.freeze<MosfetParams>({
    polarity: "pfet",
    Vth: -2.0,
    beta: 2e-2,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  });
  static modelDepNMosfet = Object.freeze<MosfetParams>({
    polarity: "nfet",
    Vth: -2.0,
    beta: 2e-2,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  });
  static modelDepPMosfet = Object.freeze<MosfetParams>({
    polarity: "pfet",
    Vth: +2.0,
    beta: 2e-2,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  });

  static override readonly id = "MOSFET";
  static override readonly numTerminals = 4;
  static override readonly paramsSchema: ParamsSchema<MosfetParams> = {
    polarity: Params.enum({
      values: [nfet, pfet],
      title: "transistor polarity",
    }),
    Vth: Params.number({
      title: "threshold voltage",
      min: -100,
      max: +100,
    }),
    beta: Params.number({
      default: 2e-2,
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

  /** The source terminal. */
  readonly ns: Node;
  /** The gate terminal. */
  readonly ng: Node;
  /** The drain terminal. */
  readonly nd: Node;
  /** The body terminal. */
  readonly nb: Node;
  /** The body-source PN junction of MOSFET. */
  private readonly pnBs: PN;
  /** The body-drain PN junction of MOSFET. */
  private readonly pnBd: PN;

  constructor(name: string, [ns, ng, nd, nb]: readonly Node[], params: MosfetParams) {
    super(name, [ns, ng, nd, nb], params);
    this.ns = ns;
    this.ng = ng;
    this.nd = nd;
    this.nb = nb;
    const { Is, N, Temp } = this.params;
    this.pnBs = new PN(Is, N, Temp);
    this.pnBd = new PN(Is, N, Temp);
  }

  override getInitialState(): Float64Array {
    return new Float64Array(S._Size_);
  }

  override eval(state: Float64Array): void {
    const { ns, ng, nd, nb, params, pnBs, pnBd } = this;
    const { polarity, Vth, beta, lambda } = params;
    const sign = fetSign(polarity);

    // DIODES

    const Vbs = (state[S.Vbs] = pnBs.limitVoltage(sign * (nb.voltage - ns.voltage), state[S.Vbs]));
    state[S.Ibs] = pnBs.evalCurrent(Vbs);
    state[S.Gbs] = pnBs.evalConductance(Vbs);

    const Vbd = (state[S.Vbd] = pnBd.limitVoltage(sign * (nb.voltage - nd.voltage), state[S.Vbd]));
    state[S.Ibd] = pnBs.evalCurrent(Vbd);
    state[S.Gbd] = pnBs.evalConductance(Vbd);

    // FET

    let Vgs = (state[S.Vgs] = sign * (ng.voltage - ns.voltage));
    let Vgd = (state[S.Vgd] = sign * (ng.voltage - nd.voltage));

    if (Vgs >= Vgd) {
      Vgs = state[S.Vgs] = limitMosfetVoltage(Vgs, state[S.Vgs]);
      const Vds = (state[S.Vds] = limitMosfetVoltage(Vgs - Vgd, state[S.Vds]));

      // Normal mode.
      const Vgst = Vgs - sign * Vth;
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
          state[S.Ids] = (1 / 2) * c1 * Vgst * Vgst;
          state[S.Gds] = (1 / 2) * beta * lambda * Vgst * Vgst;
          state[S.Gm] = c1 * Vgst;
        } else {
          // Linear region.
          state[S.Ids] = c1 * Vds * (Vgst - Vds / 2);
          state[S.Gds] = c1 * (Vgst - Vds) + beta * c0 * (Vgst - Vds / 2);
          state[S.Gm] = c1 * Vds;
        }
      }
    } else {
      Vgd = state[S.Vgd] = limitMosfetVoltage(Vgd, state[S.Vgd]);
      const Vsd = -(state[S.Vds] = -limitMosfetVoltage(Vgd - Vgs, -state[S.Vds]));

      // Inverse mode.
      const Vgdt = Vgd - sign * Vth;
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
          state[S.Ids] = -(1 / 2) * c1 * Vgdt * Vgdt;
          state[S.Gds] = (1 / 2) * beta * lambda * Vgdt * Vgdt;
          state[S.Gm] = c1 * Vgdt;
        } else {
          // Linear region.
          state[S.Ids] = -c1 * Vsd * (Vgdt - Vsd / 2);
          state[S.Gds] = c1 * Vgdt + beta * c0 * (Vgdt - Vsd / 2);
          state[S.Gm] = c1 * Vsd;
        }
      }
    }
  }

  override stamp(
    stamper: Stamper,
    [Vbs, Ibs, Gbs, Vbd, Ibd, Gbd, Vgs, Vgd, Vds, Ids, Gds, Gm]: Float64Array,
  ): void {
    const { ns, ng, nd, nb, params } = this;
    const { polarity } = params;
    const sign = fetSign(polarity);

    // DIODES

    stamper.stampConductance(nb, ns, Gbs);
    stamper.stampCurrentSource(nb, ns, sign * (Ibs - Gbs * Vbs));

    stamper.stampConductance(nb, nd, Gbd);
    stamper.stampCurrentSource(nb, nd, sign * (Ibd - Gbd * Vbd));

    // FET

    if (Vgs >= Vgd) {
      stamper.stampConductance(nd, ns, Gds);
      stamper.stampMatrix(nd, ng, Gm);
      stamper.stampMatrix(nd, ns, -Gm);
      stamper.stampMatrix(ns, ng, -Gm);
      stamper.stampMatrix(ns, ns, Gm);
      stamper.stampCurrentSource(nd, ns, sign * (Ids - Gds * Vds - Gm * Vgs));
    } else {
      stamper.stampConductance(nd, ns, Gds);
      stamper.stampMatrix(nd, ng, Gm);
      stamper.stampMatrix(nd, nd, -Gm);
      stamper.stampMatrix(ns, ng, -Gm);
      stamper.stampMatrix(ns, nd, Gm);
      stamper.stampCurrentSource(nd, ns, sign * (Ids - Gds * Vds - Gm * Vgd));
    }
  }

  override ops(
    [Vbs, Ibs, Gbs, Vbd, Ibd, Gbd, VgsX, VgdX, VdsX, Ids, Gds, Gm]: Float64Array = this.state,
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
