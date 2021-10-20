import { CircuitError } from "./error";

export type RawDeviceParams = Record<string, unknown>;

export type ParamsSchema = Readonly<Record<string, ParamsItem>>;

export type ParamsItem = NumberParamsItem | EnumParamsItem;

export type NumberParamsItem = {
  readonly type: "number";
  readonly default?: number;
  readonly min?: number;
  readonly max?: number;
  readonly title: string;
};

export type EnumParamsItem = {
  readonly type: "enum";
  readonly values: readonly string[];
  readonly default?: string;
  readonly title: string;
};

export class Params {
  static number(item: Omit<NumberParamsItem, "type">): NumberParamsItem {
    return { type: "number", ...item };
  }

  static enum(item: Omit<EnumParamsItem, "type">): EnumParamsItem {
    return { type: "enum", ...item };
  }
}

export function validateParams<T extends Record<string, unknown>>(
  rawParams: RawDeviceParams,
  schema: ParamsSchema,
): T {
  const params: [string, unknown][] = [];
  for (const name of Object.keys(rawParams)) {
    if (!(name in schema)) {
      throw new CircuitError(`Unknown parameter [${name}]`);
    }
  }
  for (const [name, item] of Object.entries(schema)) {
    const value = rawParams[name] ?? item.default ?? null;
    if (value == null) {
      throw new CircuitError(`Missing parameter [${name}]`);
    }
    switch (item.type) {
      case "number": {
        if (typeof value !== "number") {
          throw new CircuitError(
            `Invalid value for parameter [${name}], ` +
              `expected number, got ${typeof value}`,
          );
        }
        const { min, max } = item;
        if (typeof min === "number" && value < min) {
          throw new CircuitError(
            `Invalid value for parameter [${name}], ` +
              `expected value larger than or equal to ${min}`,
          );
        }
        if (typeof max === "number" && value > max) {
          throw new CircuitError(
            `Invalid value for parameter [${name}], ` +
              `expected value less than or equal to ${max}`,
          );
        }
        break;
      }
      case "enum": {
        if (typeof value !== "string") {
          throw new CircuitError(
            `Invalid value for parameter [${name}], ` +
              `expected string, got ${typeof value}`,
          );
        }
        const { values } = item;
        if (!values.includes(value)) {
          throw new CircuitError(
            `Invalid value for parameter [${name}], ` +
              `expected one of ${values.map((v) => `"${v}"`).join(", ")}`,
          );
        }
        break;
      }
    }
    params.push([name, value]);
  }
  return Object.fromEntries(params) as T;
}
