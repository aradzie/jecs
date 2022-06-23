import type { DeviceClass } from "./device.js";
import { Properties, PropertyValue } from "./properties.js";

export class Model {
  readonly modelId: string;
  readonly deviceClass: DeviceClass;
  readonly properties: Properties;

  constructor(
    modelId: string,
    deviceClass: DeviceClass,
    parameters: Record<string, PropertyValue> = {},
  ) {
    this.modelId = modelId;
    this.deviceClass = deviceClass;
    this.properties = new Properties(deviceClass.propertiesSchema);
    for (const [name, value] of Object.entries(parameters)) {
      this.properties.set(name, value);
    }
  }
}
