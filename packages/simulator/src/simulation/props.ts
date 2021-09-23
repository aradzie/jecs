import { CircuitError } from "./error";
import type { Unit } from "./unit";

export type RawDeviceProps = {
  readonly [name: string]: number;
};

export type DeviceProps = {
  readonly [name: string]: number;
};

export type DevicePropsSchema = readonly DevicePropsSchemaItem[];

export type DevicePropsSchemaItem = {
  readonly name: string;
  readonly unit: Unit;
  readonly default?: number;
};

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
