import { CircuitError } from "../error";
import type { Node } from "../network";
import {
  Device,
  DeviceClass,
  RawDeviceProps,
  validateDeviceProps,
} from "./device";
import { devices } from "./index";

const deviceMap = new Map<string, DeviceClass>();

export function registerDevice(...deviceClasses: DeviceClass[]) {
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

export function createDevice(
  id: string,
  name: string,
  nodes: readonly Node[],
  rawProps: RawDeviceProps,
): Device {
  const deviceClass = deviceMap.get(id) ?? null;
  if (deviceClass == null) {
    throw new CircuitError(`Unknown device id [${id}]`);
  }
  const { numTerminals, propsSchema } = deviceClass;
  if (nodes.length !== numTerminals) {
    throw new CircuitError(
      `Netlist error in device [${id}:${name}]: ` +
        `Invalid number of terminals`,
    );
  }
  let props;
  try {
    props = validateDeviceProps(rawProps, propsSchema);
  } catch (err) {
    throw new CircuitError(
      `Netlist error in device [${id}:${name}]: ` + err.message,
    );
  }
  return new deviceClass(nodes, { ...props, name });
}

registerDevice(...devices);
