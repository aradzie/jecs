import { CircuitError } from "./error.js";

export type PropertiesSchema = Record<string, PropertySchema>;

export type PropertySchema = NumberPropertySchema | StringPropertySchema;

export type NumberRangeOp = ">" | ">=" | "<" | "<=" | "<>";

type NumberRange0 = readonly ["real" | "integer"];
type NumberRange1 = readonly [...NumberRange0, NumberRangeOp, number];
type NumberRange2 = readonly [...NumberRange1, NumberRangeOp, number];
type NumberRange3 = readonly [...NumberRange2, NumberRangeOp, number];

export type NumberRange = NumberRange0 | NumberRange1 | NumberRange2 | NumberRange3;

export type NumberPropertySchema = {
  readonly type: "number";
  /** The default value of this property. */
  readonly defaultValue?: number;
  /** The allowed range of values. */
  readonly range?: NumberRange;
  /** Property description. */
  readonly title: string;
};

export type StringPropertySchema = {
  readonly type: "string";
  /** The default value of this property. */
  readonly defaultValue?: string;
  /** The set of allowed values. */
  readonly range?: readonly string[];
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

  /** Creates a new string property schema from the given options. */
  static string(item: Omit<StringPropertySchema, "type">): StringPropertySchema {
    return { type: "string", ...item };
  }

  /** The device temperature property. */
  static temp = Properties.number({
    defaultValue: 26.85, // Room temperature.
    range: ["real", ">", -273.15], // Absolute zero.
    title: "device temperature in degrees Celsius",
  });

  private readonly schema = new Map<string, PropertySchema>();
  private readonly values = new Map<string, PropertyValue>();

  constructor(schema: PropertiesSchema) {
    for (const [name, property] of Object.entries(schema)) {
      this.schema.set(name, property);
    }
  }

  prop(name: string): PropertySchema {
    const property = this.schema.get(name);
    if (property == null) {
      throw new CircuitError(`Unknown property [${name}]`);
    }
    return property;
  }

  from(that: Properties): void {
    for (const [name, value] of that.values.entries()) {
      this.set(name, value);
    }
  }

  hasAll(): boolean {
    for (const [name, schema] of this.schema.entries()) {
      if (!this.values.has(name) && schema.defaultValue == null) {
        return false;
      }
    }
    return true;
  }

  has(name: string): boolean {
    this.prop(name);
    return this.values.has(name);
  }

  set(name: string, value: PropertyValue): this {
    const property = this.prop(name);
    switch (property.type) {
      case "number": {
        checkNumber(property, name, value);
        break;
      }
      case "string": {
        checkString(property, name, value);
        break;
      }
    }
    this.values.set(name, value);
    return this;
  }

  getNumber(name: string, defaultValue: number | null = null): number {
    const property = this.prop(name);
    if (property.type !== "number") {
      throw new Error(`Property [${name}] is not a number`);
    }
    const value = this.values.get(name) ?? defaultValue ?? property.defaultValue;
    if (value == null) {
      throw new Error(`Property [${name}] has no value`);
    }
    return value as number;
  }

  getString(name: string, defaultValue: string | null = null): string {
    const property = this.prop(name);
    if (property.type !== "string") {
      throw new Error(`Property [${name}] is not a string`);
    }
    const value = this.values.get(name) ?? defaultValue ?? property.defaultValue;
    if (value == null) {
      throw new Error(`Property [${name}] has no value`);
    }
    return value as string;
  }
}

function checkNumber(property: NumberPropertySchema, name: string, value: unknown): void {
  if (typeof value !== "number") {
    throw new CircuitError(
      `Invalid value for property [${name}], ` + //
        `expected a number, got ${quote(value)}`,
    );
  }
  const { range = ["real"] } = property;
  const [type, ...limits] = range;
  switch (type) {
    case "real":
      if (!Number.isFinite(value)) {
        throw new CircuitError(
          `Invalid value for property [${name}], ` + //
            `not a finite value`,
        );
      }
      break;
    case "integer":
      if (!Number.isInteger(value)) {
        throw new CircuitError(
          `Invalid value for property [${name}], ` + //
            `not an integer value`,
        );
      }
      break;
  }
  let index = 0;
  while (index < limits.length) {
    const op = limits[index++] as NumberRangeOp;
    const limit = limits[index++] as number;
    switch (op) {
      case ">":
        if (value <= limit) {
          throw new CircuitError(
            `Invalid value for property [${name}], ` + //
              `expected a value larger than ${limit}, ` +
              `got ${quote(value)}`,
          );
        }
        break;
      case ">=":
        if (value < limit) {
          throw new CircuitError(
            `Invalid value for property [${name}], ` + //
              `expected a value larger than or equal to ${limit}, ` +
              `got ${quote(value)}`,
          );
        }
        break;
      case "<":
        if (value >= limit) {
          throw new CircuitError(
            `Invalid value for property [${name}], ` + //
              `expected a value less than ${limit}, ` +
              `got ${quote(value)}`,
          );
        }
        break;
      case "<=":
        if (value > limit) {
          throw new CircuitError(
            `Invalid value for property [${name}], ` + //
              `expected a value less than or equal to ${limit}, ` +
              `got ${quote(value)}`,
          );
        }
        break;
      case "<>":
        if (value === limit) {
          throw new CircuitError(
            `Invalid value for property [${name}], ` + //
              `expected a value not equal to ${limit}`,
          );
        }
        break;
    }
  }
}

function checkString(property: StringPropertySchema, name: string, value: unknown): void {
  if (typeof value !== "string") {
    throw new CircuitError(
      `Invalid value for property [${name}], ` + //
        `expected a string, got ${quote(value)}`,
    );
  }
  const { range = [] } = property;
  if (range.length > 0 && !range.includes(value)) {
    throw new CircuitError(
      `Invalid value for property [${name}], ` + //
        `expected one of {${range.map((v) => quote(v)).join(", ")}}, ` +
        `got ${quote(value)}`,
    );
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
