import type { DeviceClass } from "../circuit/device";
import { Ammeter } from "./ammeter";
import { CCCSource } from "./cccsource";
import { CCVSource } from "./ccvsource";
import { CSource } from "./csource";
import { Ground } from "./ground";
import { Bjt } from "./nonlinear/bjt";
import { Diode } from "./nonlinear/diode";
import { Mosfet } from "./nonlinear/mosfet";
import { OpAmp } from "./nonlinear/opamp";
import { Resistor } from "./resistor";
import { VCCSource } from "./vccsource";
import { VCVSource } from "./vcvsource";
import { VSource } from "./vsource";

export {
  Ammeter,
  Bjt,
  CCCSource,
  CCVSource,
  CSource,
  Diode,
  Ground,
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
  Mosfet,
  OpAmp,
  Resistor,
  VCCSource,
  VCVSource,
  VSource,
];
