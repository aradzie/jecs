import { devices } from "../device";
import { NameMap } from "../util/map";
import type { Device, DeviceClass } from "./device";
import { CircuitError } from "./error";
import type { Node } from "./network";
import {
  DeviceModel,
  DeviceParams,
  Initializer,
  validateParams,
} from "./params";

class Registration {
  private static readonly map = new NameMap<Registration>();

  static get(deviceClass: string | DeviceClass): Registration {
    const id = typeof deviceClass === "string" ? deviceClass : deviceClass.id;
    const registration = Registration.map.get(id);
    if (registration == null) {
      throw new CircuitError(`Unknown device id [${id}]`);
    } else {
      return registration;
    }
  }

  static add(deviceClass: DeviceClass): void {
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
    if (Registration.map.has(id)) {
      throw new CircuitError(`Duplicate device id [${id}]`);
    }
    const registration = new Registration(deviceClass);
    for (const [name, params] of deviceClass.getModels()) {
      registration.addModel(name, params);
    }
    Registration.map.set(id, registration);
  }

  constructor(
    readonly deviceClass: DeviceClass,
    readonly models: NameMap<DeviceParams> = new NameMap(),
  ) {}

  addModel(name: string, params: DeviceParams): void {
    this.models.set(name, { ...params });
  }

  getModel(name: string): DeviceParams {
    const params = this.models.get(name);
    if (params != null) {
      return params;
    } else {
      throw new CircuitError(`Unknown model name [${name}]`);
    }
  }

  listModels(): Iterable<DeviceModel> {
    return this.models.entries();
  }

  createDevice(
    name: string,
    nodes: readonly Node[],
    initializers: readonly Initializer[],
  ): Device {
    const { deviceClass } = this;
    const { id, numTerminals, paramsSchema } = deviceClass;
    if (nodes.length !== numTerminals) {
      throw new CircuitError(
        `Error in device [${id}:${name}]: ` + //
          `Invalid number of nodes`,
      );
    }
    let params: Record<string, number | string> = {};
    for (const initializer of initializers) {
      if (typeof initializer === "string") {
        Object.assign(params, this.getModel(initializer));
      } else {
        Object.assign(params, initializer);
      }
    }
    try {
      params = validateParams(params, paramsSchema);
    } catch (err: any) {
      throw new CircuitError(
        `Error in device [${id}:${name}]: ` + //
          `${err.message}`,
      );
    }
    return new deviceClass(name, nodes, params);
  }
}

export function registerDeviceClass(...deviceClasses: DeviceClass[]): void {
  for (const deviceClass of deviceClasses) {
    Registration.add(deviceClass);
  }
}

export function getDeviceClass(deviceClass: string | DeviceClass): DeviceClass {
  return Registration.get(deviceClass).deviceClass;
}

export function addDeviceModel(
  deviceClass: string | DeviceClass,
  name: string,
  params: DeviceParams,
): void {
  Registration.get(deviceClass).addModel(name, params);
}

export function getDeviceModel(
  deviceClass: string | DeviceClass,
  name: string,
): DeviceParams | null {
  return Registration.get(deviceClass).getModel(name);
}

export function listDeviceModels(
  deviceClass: string | DeviceClass,
): Iterable<DeviceModel> {
  return Registration.get(deviceClass).listModels();
}

export function createDevice(
  deviceClass: string | DeviceClass,
  name: string,
  nodes: readonly Node[],
  ...initializers: readonly Initializer[]
): Device {
  return Registration.get(deviceClass).createDevice(name, nodes, initializers);
}

registerDeviceClass(...devices);
