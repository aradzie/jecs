import type { DeviceClass } from "../simulation/device";
import { Ammeter } from "./ammeter";
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
