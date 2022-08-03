import { DcParams, Device, DeviceState } from "../../circuit/device.js";
import {
  stampConductance,
  stampCurrentSource,
  Stamper,
  stampTransconductance,
} from "../../circuit/mna.js";
import type { Network, Node } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";
import { celsiusToKelvin } from "../../util/unit.js";
import { gMin } from "../const.js";
import {
  BjtPolarity,
  bjtSign,
  npn,
  pnConductance,
  pnCurrent,
  pnp,
  pnTemp,
  pnVoltage,
} from "./semi.js";

const enum S {
  /** Device polarity, +1 for npn, -1 for pnp. */
  pol,
  /** Forward alpha. */
  Af,
  /** Reverse alpha. */
  Ar,
  /** Saturation current. */
  Is,
  /** Base-emitter thermal voltage. */
  Vtf,
  /** Base-collector thermal voltage. */
  Vtr,
  /** Base-emitter critical voltage. */
  Vcritf,
  /** Base-collector critical voltage. */
  Vcritr,
  /** Base-emitter voltage. */
  Vbe,
  /** Base-collector voltage. */
  Vbc,
  /** Collector-emitter voltage. */
  Vce,
  /** Emitter current. */
  Ie,
  /** Collector current. */
  Ic,
  /** Base current. */
  Ib,
  /** Forward transconductance. */
  Gf,
  /** Reverse transconductance. */
  Gr,
  _Size_,
}

/**
 * Bipolar junction transistor, BJT.
 */
export class Bjt extends Device.Dc {
  static override readonly id = "BJT";
  static override readonly numTerminals = 3;
  static override readonly propertiesSchema = {
    polarity: Properties.string({
      range: [npn, pnp],
      title: "transistor polarity",
    }),
    Bf: Properties.number({
      defaultValue: 100.0,
      range: ["real", ">", 0],
      title: "forward beta",
    }),
    Br: Properties.number({
      defaultValue: 1.0,
      range: ["real", ">", 0],
      title: "reverse beta",
    }),
    Is: Properties.number({
      defaultValue: 1e-14,
      range: ["real", ">", 0],
      title: "saturation current",
    }),
    Nf: Properties.number({
      defaultValue: 1,
      range: ["real", ">", 0],
      title: "forward emission coefficient",
    }),
    Nr: Properties.number({
      defaultValue: 1,
      range: ["real", ">", 0],
      title: "reverse emission coefficient",
    }),
    Vaf: Properties.number({
      defaultValue: 10.0,
      range: ["real", ">=", 0],
      title: "forward Early voltage",
    }),
    Var: Properties.number({
      defaultValue: 0.0,
      range: ["real", ">=", 0],
      title: "reverse Early voltage",
    }),
    temp: Properties.temp,
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.Vbe, name: "Vbe", unit: "V" },
      { index: S.Vbc, name: "Vbc", unit: "V" },
      { index: S.Vce, name: "Vce", unit: "V" },
      { index: S.Ie, name: "Ie", unit: "A" },
      { index: S.Ic, name: "Ic", unit: "A" },
      { index: S.Ib, name: "Ib", unit: "A" },
    ],
  };
  static override readonly linear = false;

  /** The emitter terminal. */
  private ne!: Node;
  /** The base terminal. */
  private nb!: Node;
  /** The collector terminal. */
  private nc!: Node;

  override connect(network: Network, [ne, nb, nc]: readonly Node[]): void {
    this.ne = ne;
    this.nb = nb;
    this.nc = nc;
  }

  override initDc(state: DeviceState, params: DcParams): void {
    const polarity = this.properties.getString("polarity") as BjtPolarity;
    const Bf = this.properties.getNumber("Bf");
    const Br = this.properties.getNumber("Br");
    const Is = this.properties.getNumber("Is");
    const Nf = this.properties.getNumber("Nf");
    const Nr = this.properties.getNumber("Nr");
    const temp = celsiusToKelvin(this.properties.getNumber("temp", params.temp));
    const pol = bjtSign(polarity);
    const Af = Bf / (Bf + 1);
    const Ar = Br / (Br + 1);
    const [Vtf, , Vcritf] = pnTemp(temp, Is, Nf);
    const [Vtr, , Vcritr] = pnTemp(temp, Is, Nr);
    const [, Ist] = pnTemp(temp, Is, 1);
    state[S.pol] = pol;
    state[S.Af] = Af;
    state[S.Ar] = Ar;
    state[S.Is] = Ist;
    state[S.Vtf] = Vtf;
    state[S.Vtr] = Vtr;
    state[S.Vcritf] = Vcritf;
    state[S.Vcritr] = Vcritr;
  }

  private eval(state: DeviceState, damped: boolean): void {
    const { ne, nb, nc } = this;
    const pol = state[S.pol];
    const Af = state[S.Af];
    const Ar = state[S.Ar];
    const Is = state[S.Is];
    const Vtf = state[S.Vtf];
    const Vtr = state[S.Vtr];
    const Vcritf = state[S.Vcritf];
    const Vcritr = state[S.Vcritr];
    let Vbe = pol * (nb.voltage - ne.voltage);
    let Vbc = pol * (nb.voltage - nc.voltage);
    if (damped) {
      Vbe = pnVoltage(Vbe, pol * state[S.Vbe], Vtf, Vcritf);
      Vbc = pnVoltage(Vbc, pol * state[S.Vbc], Vtr, Vcritr);
    }
    const If = pnCurrent(Vbe, Is, Vtf);
    const Ir = pnCurrent(Vbc, Is, Vtr);
    const Ie = Ar * Ir - If;
    const Ic = Af * If - Ir;
    const Gf = pnConductance(Vbe, Is, Vtf) + gMin;
    const Gr = pnConductance(Vbc, Is, Vtr) + gMin;
    state[S.Vbe] = pol * Vbe;
    state[S.Vbc] = pol * Vbc;
    state[S.Vce] = pol * (Vbe - Vbc);
    state[S.Ie] = pol * Ie;
    state[S.Ic] = pol * Ic;
    state[S.Ib] = pol * -(Ie + Ic);
    state[S.Gf] = Gf;
    state[S.Gr] = Gr;
  }

  override loadDc(state: DeviceState, params: DcParams, stamper: Stamper): void {
    const { ne, nb, nc } = this;
    this.eval(state, true);
    const pol = state[S.pol];
    const Af = state[S.Af];
    const Ar = state[S.Ar];
    const Vbe = pol * state[S.Vbe];
    const Vbc = pol * state[S.Vbc];
    const Ie = pol * state[S.Ie];
    const Ic = pol * state[S.Ic];
    const Gf = state[S.Gf];
    const Gr = state[S.Gr];
    const Gee = -Gf;
    const Gcc = -Gr;
    const Gec = Ar * Gr;
    const Gce = Af * Gf;
    stampConductance(stamper, ne, nb, -Gee);
    stampConductance(stamper, nc, nb, -Gcc);
    stampTransconductance(stamper, ne, nb, nc, nb, -Gec);
    stampTransconductance(stamper, nc, nb, ne, nb, -Gce);
    stampCurrentSource(stamper, ne, nb, pol * (Ie - Gee * Vbe - Gec * Vbc));
    stampCurrentSource(stamper, nc, nb, pol * (Ic - Gce * Vbe - Gcc * Vbc));
  }

  override endDc(state: DeviceState, params: DcParams): void {
    this.eval(state, false);
  }
}
