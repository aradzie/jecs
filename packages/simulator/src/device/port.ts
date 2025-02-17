import { Device } from "../circuit/index.js";

export class Port extends Device {
  static override readonly id = "p";
  static override readonly numTerminals = 1;
  static override readonly propsSchema = {};
  static override readonly stateSchema = {
    length: 0,
    ops: [],
  };
}
