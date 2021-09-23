import type { DeviceClass } from "../simulation/device";
import { Ammeter } from "./ammeter";
import { Ground } from "./ground";
import { ICISource } from "./icisource";
import { ICVSource } from "./icvsource";
import { ISource } from "./isource";
import { OpAmp } from "./opamp";
import { Resistor } from "./resistor";
import { VCISource } from "./vcisource";
import { VCVSource } from "./vcvsource";
import { VSource } from "./vsource";

export {
  Ammeter,
  Ground,
  ICISource,
  ICVSource,
  ISource,
  OpAmp,
  Resistor,
  VCISource,
  VCVSource,
  VSource,
};

export const devices: readonly DeviceClass[] = [
  Ammeter,
  Ground,
  ICISource,
  ICVSource,
  ISource,
  OpAmp,
  Resistor,
  VCISource,
  VCVSource,
  VSource,
];
