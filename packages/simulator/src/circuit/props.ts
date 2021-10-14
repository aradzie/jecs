import { CircuitError } from "./error";

export type RawDeviceProps = Record<string, unknown>;

export type PropsSchema = Readonly<Record<string, PropsItem>>;

export type PropsItem = NumberPropsItem | EnumPropsItem;

export type NumberPropsItem = {
  readonly type: "number";
  readonly default?: number;
  readonly min?: number;
  readonly max?: number;
  readonly title: string;
};

export type EnumPropsItem = {
  readonly type: "enum";
  readonly values: readonly string[];
  readonly default?: string;
  readonly title: string;
};

export class Props {
  static number(item: Omit<NumberPropsItem, "type">): NumberPropsItem {
    return { type: "number", ...item };
  }

  static enum(item: Omit<EnumPropsItem, "type">): EnumPropsItem {
    return { type: "enum", ...item };
  }
}

export function validateProps<T extends Record<string, unknown>>(
  rawProps: RawDeviceProps,
  schema: PropsSchema,
): T {
  const props: [string, unknown][] = [];
  for (const name of Object.keys(rawProps)) {
    if (!(name in schema)) {
      throw new CircuitError(`Unknown property [${name}]`);
    }
  }
  for (const [name, item] of Object.entries(schema)) {
    const value = rawProps[name] ?? item.default ?? null;
    if (value == null) {
      throw new CircuitError(`Missing property [${name}]`);
    }
    switch (item.type) {
      case "number": {
        if (typeof value !== "number") {
          throw new CircuitError(
            `Invalid value for property [${name}], ` +
              `expected number, got ${typeof value}`,
          );
        }
        const { min, max } = item;
        if (typeof min === "number" && value < min) {
          throw new CircuitError(
            `Invalid value for property [${name}], ` +
              `expected value larger than or equal to ${min}`,
          );
        }
        if (typeof max === "number" && value > max) {
          throw new CircuitError(
            `Invalid value for property [${name}], ` +
              `expected value less than or equal to ${max}`,
          );
        }
        break;
      }
      case "enum": {
        if (typeof value !== "string") {
          throw new CircuitError(
            `Invalid value for property [${name}], ` +
              `expected string, got ${typeof value}`,
          );
        }
        const { values } = item;
        if (!values.includes(value)) {
          throw new CircuitError(
            `Invalid value for property [${name}], ` +
              `expected one of ${values.map((v) => `"${v}"`).join(", ")}`,
          );
        }
        break;
      }
    }
    props.push([name, value]);
  }
  return Object.fromEntries(props) as T;
}
