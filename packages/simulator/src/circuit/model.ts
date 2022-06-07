import type { DeviceClass } from "./device.js";
import { Properties } from "./properties.js";

export class Model {
  readonly modelId: string;
  readonly deviceClass: DeviceClass;
  readonly properties: Properties;

  constructor(
    modelId: string,
    deviceClass: DeviceClass,
    parameters: Record<string, number | string> = {},
  ) {
    this.modelId = modelId;
    this.deviceClass = deviceClass;
    this.properties = new Properties(deviceClass.propertiesSchema);
    for (const [name, value] of Object.entries(parameters)) {
      this.properties.set(name, value);
    }
  }
}
