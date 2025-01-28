import { Device } from "../circuit/device.js";

export class Ground extends Device {
  static override readonly id = "ground";
  static override readonly numTerminals = 1;
  static override readonly propertiesSchema = {};
  static override readonly stateSchema = {
    length: 0,
    ops: [],
  };
}
