import { CircuitError } from "./error.js";

/** The default simulation temperature. */
export const Temp = 26.85;

export type PropertiesSchema = Record<string, PropertySchema>;

export type PropertySchema = NumberPropertySchema | EnumPropertySchema;

export type NumberPropertySchema = {
  readonly type: "number";
  /** The default value of this property. */
  readonly default?: number;
  /** The minimal allowed value of this property. */
  readonly min?: number;
  /** The maximal allowed value of this property. */
  readonly max?: number;
  /** Property description. */
  readonly title: string;
};

export type EnumPropertySchema = {
  readonly type: "enum";
  /** The set of allowed values. */
  readonly values: readonly string[];
  /** The default value of this property. */
  readonly default?: string;
  /** Property description. */
  readonly title: string;
};

export type PropertyValue = number | string;

/**
 * A helper class to build and validate device properties.
 */
export class Properties {
  /** Creates a new number property schema from the given options. */
  static number(item: Omit<NumberPropertySchema, "type">): NumberPropertySchema {
    return { type: "number", ...item };
  }

  /** Creates a new enum property schema from the given options. */
  static enum(item: Omit<EnumPropertySchema, "type">): EnumPropertySchema {
    return { type: "enum", ...item };
  }

  /** The device temperature property. */
  static Temp = Properties.number({
    default: Temp,
    min: -273.15, // Absolute zero.
    title: "device temperature",
  });

  private readonly schema = new Map<string, PropertySchema>();
  private readonly values = new Map<string, PropertyValue>();

  constructor(schema: PropertiesSchema) {
    for (const [name, property] of Object.entries(schema)) {
      this.schema.set(name, property);
      if (property.default != null) {
        this.values.set(name, property.default);
      }
    }
  }

  from(that: Properties): void {
    for (const [name, value] of that.values.entries()) {
      this.set(name, value);
    }
  }

  allSet(): boolean {
    for (const name of this.schema.keys()) {
      if (!this.values.has(name)) {
        return false;
      }
    }
    return true;
  }

  set(name: string, value: PropertyValue): this {
    const property = this.schema.get(name);
    if (property == null) {
      throw new CircuitError(`Unknown property [${name}]`);
    }
    switch (property.type) {
      case "number": {
        if (typeof value !== "number") {
          throw new CircuitError(
            `Invalid value for property [${name}], ` + //
              `expected a number, got ${quote(value)}`,
          );
        }
        const { min, max } = property;
        if (typeof min === "number" && value < min) {
          throw new CircuitError(
            `Invalid value for property [${name}], ` + //
              `expected a value larger than or equal to ${min}, ` +
              `got ${quote(value)}`,
          );
        }
        if (typeof max === "number" && value > max) {
          throw new CircuitError(
            `Invalid value for property [${name}], ` + //
              `expected a value less than or equal to ${max}, ` +
              `got ${quote(value)}`,
          );
        }
        break;
      }
      case "enum": {
        if (typeof value !== "string") {
          throw new CircuitError(
            `Invalid value for property [${name}], ` + //
              `expected a string, got ${quote(value)}`,
          );
        }
        const { values } = property;
        if (!values.includes(value)) {
          throw new CircuitError(
            `Invalid value for property [${name}], ` + //
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

  getNumber(name: string): number {
    const property = this.schema.get(name);
    if (property == null) {
      throw new Error(`Unknown property [${name}]`);
    }
    if (property.type !== "number") {
      throw new Error(`Property [${name}] is not a number`);
    }
    const value = this.values.get(name);
    if (value == null) {
      throw new Error(`Property [${name}] has no value`);
    }
    return value as number;
  }

  getEnum(name: string): string {
    const property = this.schema.get(name);
    if (property == null) {
      throw new Error(`Unknown property [${name}]`);
    }
    if (property.type !== "enum") {
      throw new Error(`Property [${name}] is not an enum`);
    }
    const value = this.values.get(name);
    if (value == null) {
      throw new Error(`Property [${name}] has no value`);
    }
    return value as string;
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
