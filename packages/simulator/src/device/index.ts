import type { DeviceClass } from "../circuit/device.js";
import { Ground } from "./ground.js";
import { Capacitor } from "./lumped/capacitor.js";
import { Inductor } from "./lumped/inductor.js";
import { Resistor } from "./lumped/resistor.js";
import { Bjt } from "./nonlinear/bjt.js";
import { Diode } from "./nonlinear/diode.js";
import { Jfet } from "./nonlinear/jfet.js";
import { Mosfet } from "./nonlinear/mosfet.js";
import { OpAmp } from "./nonlinear/opamp.js";
import { Port } from "./port.js";
import { Ammeter } from "./probe/ammeter.js";
import { Voltmeter } from "./probe/voltmeter.js";
import { CCCS } from "./source/cccs.js";
import { CCVS } from "./source/ccvs.js";
import { Iac } from "./source/iac.js";
import { Idc } from "./source/idc.js";
import { Vac } from "./source/vac.js";
import { VCCS } from "./source/vccs.js";
import { VCVS } from "./source/vcvs.js";
import { Vdc } from "./source/vdc.js";

export {
  Ammeter,
  Port,
  Bjt,
  CCCS,
  CCVS,
  Capacitor,
  Diode,
  Ground,
  Iac,
  Idc,
  Inductor,
  Jfet,
  Mosfet,
  OpAmp,
  Resistor,
  VCCS,
  VCVS,
  Vac,
  Vdc,
  Voltmeter,
};

export const devices: readonly DeviceClass[] = [
  Ammeter,
  Bjt,
  CCCS,
  CCVS,
  Capacitor,
  Diode,
  Iac,
  Idc,
  Inductor,
  Jfet,
  Mosfet,
  OpAmp,
  Resistor,
  VCCS,
  VCVS,
  Vac,
  Vdc,
  Voltmeter,
];
