import type { DeviceClass } from "../circuit/device";
import { Ammeter } from "./ammeter";
import { Ground } from "./ground";
import { Bjt } from "./nonlinear/bjt";
import { Diode } from "./nonlinear/diode";
import { Jfet } from "./nonlinear/jfet";
import { Mosfet } from "./nonlinear/mosfet";
import { OpAmp } from "./nonlinear/opamp";
import { Resistor } from "./resistor";
import { CCCSource } from "./source/cccsource";
import { CCVSource } from "./source/ccvsource";
import { CSource } from "./source/csource";
import { VCCSource } from "./source/vccsource";
import { VCVSource } from "./source/vcvsource";
import { VSource } from "./source/vsource";

export {
  Ammeter,
  Bjt,
  CCCSource,
  CCVSource,
  CSource,
  Diode,
  Ground,
  Jfet,
  Mosfet,
  OpAmp,
  Resistor,
  VCCSource,
  VCVSource,
  VSource,
};

export const devices: readonly DeviceClass[] = [
  Ammeter,
  Bjt,
  CCCSource,
  CCVSource,
  CSource,
  Diode,
  Ground,
  Jfet,
  Mosfet,
  OpAmp,
  Resistor,
  VCCSource,
  VCVSource,
  VSource,
];
