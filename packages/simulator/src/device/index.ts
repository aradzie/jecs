import type { DeviceClass } from "../circuit/device";
import { Ammeter } from "./ammeter";
import { Bjt } from "./bjt";
import { CCCSource } from "./cccsource";
import { CCVSource } from "./ccvsource";
import { CSource } from "./csource";
import { Diode } from "./diode";
import { Ground } from "./ground";
import { OpAmp } from "./opamp";
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
  OpAmp,
  Resistor,
  VCCSource,
  VCVSource,
  VSource,
];
