import { Device } from "../circuit/device.js";

export const dummy = new (class Dummy extends Device {
  static override readonly id = "DUMMY";
  static override readonly numTerminals = 0;
  static override readonly propertiesSchema = {};
  static override readonly stateSchema = {
    length: 0,
    ops: [],
  };

  constructor() {
    super("DUMMY", []);
  }
})();
