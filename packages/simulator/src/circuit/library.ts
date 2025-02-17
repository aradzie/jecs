import { type DeviceClass } from "./device.js";
import { CircuitError } from "./error.js";

class Registration {
  private static readonly map = new Map<string, Registration>();

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
    Registration.map.set(classId, new Registration(deviceClass));
  }

  constructor(readonly deviceClass: DeviceClass) {}
}

export function registerDeviceClass(...deviceClasses: DeviceClass[]): void {
  for (const deviceClass of deviceClasses) {
    Registration.add(deviceClass);
  }
}

export function getDeviceClass(deviceClass: string | DeviceClass): DeviceClass {
  return Registration.get(deviceClass).deviceClass;
}
