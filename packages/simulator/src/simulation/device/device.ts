import type { Network, Node, Stamper } from "../network";

// pin
// two-terminal, three-terminal, etc
// one-port
// two-port

export enum Unit {
  UNITLESS,
  VOLT,
  AMPERE,
  OHM,
  SIEMENS,
  FARAD,
  HENRY,
  HERTZ,
  METER,
  GRAM,
}

export type DeviceProps = {
  readonly name: string;
};

export type AnyDeviceProps = DeviceProps & {
  readonly [name: string]: string | number;
};

export type DevicePropsSchema = readonly DevicePropsSchemaItem[];

export type DevicePropsSchemaItem = {
  readonly name: string;
  readonly unit: Unit;
  readonly default?: number;
};

export interface DeviceClass {
  readonly id: string;
  readonly numTerminals: number;
  readonly propsSchema: DevicePropsSchema;
  new (nodes: readonly Node[], props: any): Device;
}

export abstract class Device {
  static readonly id: string;
  static readonly numTerminals: number;
  static readonly propsSchema: DevicePropsSchema;

  readonly nodes: Node[];
  readonly name: string;

  constructor(nodes: readonly Node[], name: string) {
    this.nodes = [...nodes];
    this.name = name;
  }

  /**
   * Circuit call this method to let a device
   * to allocate extra nodes and branches.
   * @param network A network which contains allocated nodes and branches.
   */
  connect(network: Network): void {}

  /**
   * Circuit calls this method to let a device
   * to stamp MAN matrix and RHS vector.
   * @param stamper A stamper which updates MNA matrix and RHS vector.
   */
  stamp(stamper: Stamper): void {}

  update(): void {}
}

export function validateProps(
  props: AnyDeviceProps,
  schema: DevicePropsSchema,
): void {
  const itemMap = new Map<string, DevicePropsSchemaItem>();
  for (const item of schema) {
    itemMap.set(item.name, item);
  }
}
