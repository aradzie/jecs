import { devices } from "../device";
import type { Device, DeviceClass } from "./device";
import { CircuitError } from "./error";
import type { Node } from "./network";
import { RawDeviceProps, validateProps } from "./props";

const deviceMap = new Map<string, DeviceClass>();

export function registerDeviceClass(...deviceClasses: DeviceClass[]): void {
  for (const deviceClass of deviceClasses) {
    const { id, numTerminals, propsSchema } = deviceClass;
    if (id == null) {
      throw new CircuitError(
        `The [id] attribute is missing` + //
          ` in device class [${deviceClass}]`,
      );
    }
    if (numTerminals == null) {
      throw new CircuitError(
        `The [numTerminals] attribute is missing in` + //
          ` device class [${deviceClass}]`,
      );
    }
    if (propsSchema == null) {
      throw new CircuitError(
        `The [propsSchema] attribute is missing` + //
          ` in device class [${deviceClass}]`,
      );
    }
    if (deviceMap.has(id)) {
      throw new CircuitError(`Duplicate device id [${id}]`);
    }
    deviceMap.set(id, deviceClass);
  }
}

export function getDeviceClass(id: string): DeviceClass {
  const deviceClass = deviceMap.get(id) ?? null;
  if (deviceClass == null) {
    throw new CircuitError(`Unknown device id [${id}]`);
  }
  return deviceClass;
}

export function createDevice(
  deviceClass: string | DeviceClass,
  name: string,
  nodes: readonly Node[],
  rawProps: RawDeviceProps,
): Device {
  if (typeof deviceClass === "string") {
    deviceClass = getDeviceClass(deviceClass);
  }
  const { id, numTerminals, propsSchema } = deviceClass;
  if (nodes.length !== numTerminals) {
    throw new CircuitError(
      `Error in device [${id}:${name}]: ` + //
        `Invalid number of nodes`,
    );
  }
  let props;
  try {
    props = validateProps(rawProps, propsSchema);
  } catch (err) {
    throw new CircuitError(
      `Error in device [${id}:${name}]: ` + //
        `${err.message}`,
    );
  }
  return new deviceClass(name, nodes, props);
}

registerDeviceClass(...devices);
