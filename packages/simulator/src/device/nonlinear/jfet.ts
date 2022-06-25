import { Device, DeviceState, EvalParams } from "../../circuit/device.js";
import type { Node, Stamper } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";
import { celsiusToKelvin } from "../../util/unit.js";
import { gMin } from "../const.js";
import {
  FetPolarity,
  fetSign,
  nfet,
  pfet,
  pnConductance,
  pnCurrent,
  pnTemp,
  pnVoltage,
} from "./semi.js";

const enum S {
  /** Device polarity, +1 for nfet, -1 for pfet. */
  pol,
  /** Threshold voltage. */
  Vth,
  /** Transconductance parameter. */
  beta,
  /** Channel-length modulation parameter. */
  lambda,
  /** Saturation current. */
  Is,
  /** Thermal voltage. */
  Vt,
  /** Critical voltage. */
  Vcrit,
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
export class Jfet extends Device {
  static override readonly id = "JFET";
  static override readonly numTerminals = 3;
  static override readonly propertiesSchema = {
    polarity: Properties.string({
      range: [nfet, pfet],
      title: "transistor polarity",
    }),
    Vth: Properties.number({
      defaultValue: -2.0,
      range: ["real"],
      title: "threshold voltage",
    }),
    beta: Properties.number({
      defaultValue: 1e-4,
      range: ["real", ">", 0],
      title: "transconductance parameter",
    }),
    lambda: Properties.number({
      defaultValue: 0.0,
      range: ["real", ">=", 0],
      title: "channel-length modulation parameter",
    }),
    Is: Properties.number({
      defaultValue: 1e-14,
      range: ["real", ">", 0],
      title: "saturation current",
    }),
    N: Properties.number({
      defaultValue: 1,
      range: ["real", ">", 0],
      title: "emission coefficient",
    }),
    temp: Properties.temp,
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.Vgs, name: "Vgs", unit: "V" },
      { index: S.Vgd, name: "Vgd", unit: "V" },
      { index: S.Vds, name: "Vds", unit: "V" },
      { index: S.Ids, name: "Ids", unit: "A" },
      // { index: S.Gm, name: "gm", unit: "A/V" },
    ],
  };
  static override readonly linear = false;

  /** The source terminal. */
  readonly ns: Node;
  /** The gate terminal. */
  readonly ng: Node;
  /** The drain terminal. */
  readonly nd: Node;

  constructor(id: string, [ns, ng, nd]: readonly Node[]) {
    super(id, [ns, ng, nd]);
    this.ns = ns;
    this.ng = ng;
    this.nd = nd;
  }

  override deriveState(state: DeviceState, params: EvalParams): void {
    const polarity = this.properties.getString("polarity") as FetPolarity;
    const Vth = this.properties.getNumber("Vth");
    const beta = this.properties.getNumber("beta");
    const lambda = this.properties.getNumber("lambda");
    const Is = this.properties.getNumber("Is");
    const N = this.properties.getNumber("N");
    const temp = celsiusToKelvin(this.properties.getNumber("temp", params.temp));
    const pol = fetSign(polarity);
    const [Vt, Ist, Vcrit] = pnTemp(temp, Is, N);
    state[S.pol] = pol;
    state[S.Vth] = Vth;
    state[S.beta] = beta;
    state[S.lambda] = lambda;
    state[S.Is] = Ist;
    state[S.Vt] = Vt;
    state[S.Vcrit] = Vcrit;
  }

  private eval0(state: DeviceState, damped: boolean): void {
    const { ns, ng, nd } = this;
    const pol = state[S.pol];
    const Vth = state[S.Vth];
    const beta = state[S.beta];
    const lambda = state[S.lambda];
    const Is = state[S.Is];
    const Vt = state[S.Vt];
    const Vcrit = state[S.Vcrit];

    // VOLTAGES

    let Vgs = pol * (ng.voltage - ns.voltage);
    let Vgd = pol * (ng.voltage - nd.voltage);
    if (damped) {
      Vgs = pnVoltage(Vgs, pol * state[S.Vgs], Vt, Vcrit);
      Vgd = pnVoltage(Vgd, pol * state[S.Vgd], Vt, Vcrit);
    }
    const Vds = Vgs - Vgd;

    // DIODES

    const Igs = pnCurrent(Vgs, Is, Vt);
    const Ggs = pnConductance(Vgs, Is, Vt) + gMin;
    const Igd = pnCurrent(Vgd, Is, Vt);
    const Ggd = pnConductance(Vgd, Is, Vt) + gMin;

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
        Gds = gMin;
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
        Gds = gMin;
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

  override eval(state: DeviceState): void {
    this.eval0(state, true);
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { ns, ng, nd } = this;
    const pol = state[S.pol];
    const Vgs = pol * state[S.Vgs];
    const Igs = pol * state[S.Igs];
    const Ggs = state[S.Ggs];
    const Vgd = pol * state[S.Vgd];
    const Igd = pol * state[S.Igd];
    const Ggd = state[S.Gds];
    const Vds = pol * state[S.Vds];
    const Ids = pol * state[S.Ids];
    const Gds = state[S.Gds];
    const Gm = state[S.Gm];

    // DIODES

    stamper.stampConductance(ng, ns, Ggs);
    stamper.stampCurrentSource(ng, ns, pol * (Igs - Ggs * Vgs));

    stamper.stampConductance(ng, nd, Ggd);
    stamper.stampCurrentSource(ng, nd, pol * (Igd - Ggd * Vgd));

    // FET

    stamper.stampConductance(nd, ns, Gds);
    stamper.stampTransconductance(nd, ns, ng, ns, Gm);
    stamper.stampCurrentSource(nd, ns, pol * (Ids - Gds * Vds - Gm * Vgs));
  }

  override endEval(state: DeviceState): void {
    this.eval0(state, false);
  }
}
