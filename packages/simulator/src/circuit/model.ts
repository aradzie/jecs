import type { DeviceClass } from "./device.js";
import { Props, PropValue } from "./props.js";

export class Model {
  readonly modelId: string;
  readonly deviceClass: DeviceClass;
  readonly props: Props;

  constructor(
    modelId: string,
    deviceClass: DeviceClass,
    parameters: Record<string, PropValue> = {},
  ) {
    this.modelId = modelId;
    this.deviceClass = deviceClass;
    this.props = new Props(deviceClass.propsSchema);
    for (const [name, value] of Object.entries(parameters)) {
      this.props.set(name, value);
    }
  }
}
