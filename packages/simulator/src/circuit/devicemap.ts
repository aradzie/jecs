import { devices } from "../device";
import type { Device, DeviceClass } from "./device";
import { CircuitError } from "./error";
import type { Node } from "./network";
import { RawDeviceParams, validateParams } from "./params";

const deviceMap = new Map<string, DeviceClass>();

export function registerDeviceClass(...deviceClasses: DeviceClass[]): void {
  for (const deviceClass of deviceClasses) {
    const { id, numTerminals, paramsSchema } = deviceClass;
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
    if (paramsSchema == null) {
      throw new CircuitError(
        `The [paramsSchema] attribute is missing` + //
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
  rawParams: RawDeviceParams,
): Device {
  if (typeof deviceClass === "string") {
    deviceClass = getDeviceClass(deviceClass);
  }
  const { id, numTerminals, paramsSchema } = deviceClass;
  if (nodes.length !== numTerminals) {
    throw new CircuitError(
      `Error in device [${id}:${name}]: ` + //
        `Invalid number of nodes`,
    );
  }
  let params;
  try {
    params = validateParams(rawParams, paramsSchema);
  } catch (err: any) {
    throw new CircuitError(
      `Error in device [${id}:${name}]: ` + //
        `${err.message}`,
    );
  }
  return new deviceClass(name, nodes, params);
}

registerDeviceClass(...devices);
