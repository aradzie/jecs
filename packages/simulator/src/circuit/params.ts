import { Temp } from "../device/const";
import { CircuitError } from "./error";

export type ParamsSchema<T = any> = Record<keyof T, Param>;

export type Param = NumberParam | EnumParam;

export type NumberParam = {
  readonly type: "number";
  /** The default value of this parameter. */
  readonly default?: number;
  /** The minimal allowed value of this parameter. */
  readonly min?: number;
  /** The maximal allowed value of this parameter. */
  readonly max?: number;
  /** Parameter description. */
  readonly title: string;
};

export type EnumParam = {
  readonly type: "enum";
  /** The set of allowed values. */
  readonly values: readonly string[];
  /** The default value of this parameter. */
  readonly default?: string;
  /** Parameter description. */
  readonly title: string;
};

export type ParamValue = number | string;

export type DeviceParams = Record<string, ParamValue>;

export class Params {
  /** Creates a new number parameter schema from the given options. */
  static number(item: Omit<NumberParam, "type">): NumberParam {
    return { type: "number", ...item };
  }

  /** Creates a new enum parameter schema from the given options. */
  static enum(item: Omit<EnumParam, "type">): EnumParam {
    return { type: "enum", ...item };
  }

  /** The device temperature parameter. */
  static Temp = Params.number({
    default: Temp,
    min: -273.15, // Absolute zero.
    title: "device temperature",
  });
}

type NamedParam = {
  readonly name: string;
  readonly param: Param;
};

/**
 * A helper class to build and validate device parameters.
 */
export class ParamsMap {
  private readonly schema = new Map<string, NamedParam>();
  private readonly values = new Map<string, ParamValue>();

  constructor(schema: ParamsSchema) {
    for (const [name, param] of Object.entries(schema)) {
      this.schema.set(name.toLowerCase(), { name, param });
      if (param.default != null) {
        this.values.set(name, param.default);
      }
    }
  }

  setAll(values: DeviceParams): this {
    for (const [name, value] of Object.entries(values)) {
      this.set(name, value);
    }
    return this;
  }

  set(anyName: string, value: ParamValue): this {
    const namedParam = this.schema.get(anyName.toLowerCase());
    if (namedParam == null) {
      throw new CircuitError(`Unknown parameter [${anyName}]`);
    }
    const { name, param } = namedParam;
    switch (param.type) {
      case "number": {
        if (typeof value !== "number") {
          throw new CircuitError(
            `Invalid value for parameter [${name}], ` +
              `expected a number, got ${quote(value)}`,
          );
        }
        const { min, max } = param;
        if (typeof min === "number" && value < min) {
          throw new CircuitError(
            `Invalid value for parameter [${name}], ` +
              `expected a value larger than or equal to ${min}, ` +
              `got ${quote(value)}`,
          );
        }
        if (typeof max === "number" && value > max) {
          throw new CircuitError(
            `Invalid value for parameter [${name}], ` +
              `expected a value less than or equal to ${max}, ` +
              `got ${quote(value)}`,
          );
        }
        break;
      }
      case "enum": {
        if (typeof value !== "string") {
          throw new CircuitError(
            `Invalid value for parameter [${name}], ` +
              `expected a string, got ${quote(value)}`,
          );
        }
        const { values } = param;
        if (!values.includes(value)) {
          throw new CircuitError(
            `Invalid value for parameter [${name}], ` +
              `expected one of {${values.map((v) => quote(v)).join(", ")}}, ` +
              `got ${quote(value)}`,
          );
        }
        break;
      }
    }
    this.values.set(name, value);
    return this;
  }

  build(): DeviceParams {
    const result = {} as DeviceParams;
    for (const { name } of this.schema.values()) {
      const value = this.values.get(name);
      if (value == null) {
        throw new CircuitError(`Missing parameter [${name}]`);
      }
      result[name] = value;
    }
    return result;
  }
}

function quote(value: unknown): string {
  switch (typeof value) {
    case "string":
      return `"${value}"`;
    case "number":
      return String(value);
  }
  return `[${value}]`;
}
