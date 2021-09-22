import { CircuitError } from "../error";
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

export type RawDeviceProps = {
  readonly [name: string]: number;
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

export function validateDeviceProps(
  rawProps: RawDeviceProps,
  schema: DevicePropsSchema,
): DeviceProps {
  const itemMap = new Map<string, DevicePropsSchemaItem>();
  for (const item of schema) {
    itemMap.set(item.name, item);
  }
  const props: [string, unknown][] = [];
  for (const [name, value] of Object.entries(rawProps)) {
    const schemaItem = itemMap.get(name) ?? null;
    if (schemaItem == null) {
      throw new CircuitError(`Unknown property [${name}]`);
    }
    itemMap.delete(name);
    props.push([name, value]);
  }
  for (const schemaItem of itemMap.values()) {
    const { name, default: def } = schemaItem;
    if (def != null) {
      props.push([name, def]);
    } else {
      throw new CircuitError(`Missing property [${name}]`);
    }
  }
  return Object.fromEntries(props) as DeviceProps;
}
