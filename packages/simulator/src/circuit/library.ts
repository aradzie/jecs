import { devices } from "../device/index.js";
import { NameMap } from "../util/map.js";
import type { Device, DeviceClass } from "./device.js";
import { CircuitError } from "./error.js";
import type { Node } from "./network.js";
import { DeviceParams, ParamsMap, ParamsSchema } from "./params.js";

export type ModelName = string;

export type DeviceModel = [name: ModelName, params: DeviceParams];

export type Initializer = ModelName | DeviceParams;

class Registration {
  private static readonly map = new NameMap<Registration>();

  static get(deviceClass: string | DeviceClass): Registration {
    const classId = typeof deviceClass === "string" ? deviceClass : deviceClass.id;
    const registration = Registration.map.get(classId);
    if (registration == null) {
      throw new CircuitError(`Unknown device class [${classId}]`);
    } else {
      return registration;
    }
  }

  static add(deviceClass: DeviceClass): void {
    const { id: classId } = deviceClass;
    if (Registration.map.has(classId)) {
      throw new CircuitError(`Duplicate device class [${classId}]`);
    }
    const registration = new Registration(deviceClass);
    for (const [name, params] of deviceClass.getModels()) {
      registration.addModel(name, params);
    }
    Registration.map.set(classId, registration);
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
      throw new CircuitError(`Unknown model [${name}]`);
    }
  }

  listModels(): Iterable<DeviceModel> {
    return this.models.entries();
  }

  createDevice(
    instanceId: string,
    nodes: readonly Node[],
    initializers: readonly Initializer[],
  ): Device {
    const { deviceClass } = this;
    const { id: classId, numTerminals, paramsSchema } = deviceClass;

    if (nodes.length !== numTerminals) {
      throw new CircuitError(
        `Error in device [${classId}:${instanceId}]: ` + //
          `Invalid number of nodes`,
      );
    }

    let params: DeviceParams;

    try {
      params = this.makeParams(paramsSchema, initializers);
    } catch (err: any) {
      throw new CircuitError(
        `Error in device [${classId}:${instanceId}]: ` + //
          err.message,
      );
    }

    return new deviceClass(instanceId, nodes, params);
  }

  private makeParams(paramsSchema: ParamsSchema, initializers: readonly Initializer[]) {
    const paramsMap = new ParamsMap(paramsSchema);
    for (const initializer of initializers) {
      if (typeof initializer === "string") {
        paramsMap.setAll(this.getModel(initializer));
      } else {
        paramsMap.setAll(initializer);
      }
    }
    return paramsMap.build();
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
  modelName: string,
  params: DeviceParams,
): void {
  Registration.get(deviceClass).addModel(modelName, params);
}

export function getDeviceModel(
  deviceClass: string | DeviceClass,
  modelName: string,
): DeviceParams | null {
  return Registration.get(deviceClass).getModel(modelName);
}

export function listDeviceModels(deviceClass: string | DeviceClass): Iterable<DeviceModel> {
  return Registration.get(deviceClass).listModels();
}

export function createDevice(
  deviceClass: string | DeviceClass,
  instanceId: string,
  nodes: readonly Node[],
  ...initializers: readonly Initializer[]
): Device {
  return Registration.get(deviceClass).createDevice(instanceId, nodes, initializers);
}

registerDeviceClass(...devices);
