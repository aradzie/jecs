export type PropsSchema = Record<string, PropSchema>;

export type PropSchema = NumberPropSchema | StringPropSchema;

export type NumberRangeOp = ">" | ">=" | "<" | "<=" | "<>";

type NumberRange0 = readonly ["real" | "integer"];
type NumberRange1 = readonly [...NumberRange0, NumberRangeOp, number];
type NumberRange2 = readonly [...NumberRange1, NumberRangeOp, number];
type NumberRange3 = readonly [...NumberRange2, NumberRangeOp, number];

export type NumberRange = NumberRange0 | NumberRange1 | NumberRange2 | NumberRange3;

export type NumberPropSchema = {
  readonly type: "number";
  /** The default value of this property. */
  readonly defaultValue?: number;
  /** The allowed range of values. */
  readonly range?: NumberRange;
  /** Property description. */
  readonly title: string;
};

export type StringPropSchema = {
  readonly type: "string";
  /** The default value of this property. */
  readonly defaultValue?: string;
  /** The set of allowed values. */
  readonly range?: readonly string[];
  /** Property description. */
  readonly title: string;
};

export type PropValue = number | string;

/**
 * A helper class to build and validate device properties.
 */
export class Props {
  /** Creates a new number property schema from the given options. */
  static number(item: Omit<NumberPropSchema, "type">): NumberPropSchema {
    return { type: "number", ...item };
  }

  /** Creates a new string property schema from the given options. */
  static string(item: Omit<StringPropSchema, "type">): StringPropSchema {
    return { type: "string", ...item };
  }

  /** The device temperature property. */
  static temp = Props.number({
    defaultValue: 26.85, // Room temperature.
    range: ["real", ">", -273.15], // Absolute zero.
    title: "device temperature in degrees Celsius",
  });

  private readonly schema = new Map<string, PropSchema>();
  private readonly values = new Map<string, PropValue>();

  constructor(schema: PropsSchema) {
    for (const [name, prop] of Object.entries(schema)) {
      this.schema.set(name, prop);
    }
  }

  names(): string[] {
    return [...this.schema.keys()];
  }

  prop(name: string): PropSchema {
    const prop = this.schema.get(name);
    if (prop == null) {
      const names = this.names();
      throw new TypeError(
        `Unknown property [${name}]. ` + //
          `Expected one of ${names.map((v) => `[${v}]`).join(", ")}.`,
      );
    }
    return prop;
  }

  from(that: Props): void {
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

  set(name: string, value: PropValue): this {
    const prop = this.prop(name);
    switch (prop.type) {
      case "number": {
        checkNumber(prop, name, value);
        break;
      }
      case "string": {
        checkString(prop, name, value);
        break;
      }
    }
    this.values.set(name, value);
    return this;
  }

  getNumber(name: string, defaultValue: number | null = null): number {
    const prop = this.prop(name);
    if (prop.type !== "number") {
      throw new TypeError(`Property [${name}] is not a number.`);
    }
    const value = this.values.get(name) ?? defaultValue ?? prop.defaultValue;
    if (value == null) {
      throw new TypeError(`Property [${name}] has no value.`);
    }
    return value as number;
  }

  getString(name: string, defaultValue: string | null = null): string {
    const prop = this.prop(name);
    if (prop.type !== "string") {
      throw new TypeError(`Property [${name}] is not a string.`);
    }
    const value = this.values.get(name) ?? defaultValue ?? prop.defaultValue;
    if (value == null) {
      throw new TypeError(`Property [${name}] has no value.`);
    }
    return value as string;
  }
}

function checkNumber(prop: NumberPropSchema, name: string, value: unknown): void {
  if (typeof value !== "number") {
    throw new TypeError(
      `Invalid value for property [${name}]. ` + //
        `Expected a number, got ${quote(value)}.`,
    );
  }
  const { range = ["real"] } = prop;
  const [type, ...limits] = range;
  switch (type) {
    case "real":
      if (!Number.isFinite(value)) {
        throw new TypeError(
          `Invalid value for property [${name}]. ` + //
            `Not a finite value.`,
        );
      }
      break;
    case "integer":
      if (!Number.isInteger(value)) {
        throw new TypeError(
          `Invalid value for property [${name}]. ` + //
            `Not an integer value.`,
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
          throw new TypeError(
            `Invalid value for property [${name}]. ` + //
              `Expected a value larger than ${limit}, ` +
              `got ${quote(value)}.`,
          );
        }
        break;
      case ">=":
        if (value < limit) {
          throw new TypeError(
            `Invalid value for property [${name}]. ` + //
              `Expected a value larger than or equal to ${limit}, ` +
              `got ${quote(value)}.`,
          );
        }
        break;
      case "<":
        if (value >= limit) {
          throw new TypeError(
            `Invalid value for property [${name}]. ` + //
              `Expected a value less than ${limit}, ` +
              `got ${quote(value)}.`,
          );
        }
        break;
      case "<=":
        if (value > limit) {
          throw new TypeError(
            `Invalid value for property [${name}]. ` + //
              `Expected a value less than or equal to ${limit}, ` +
              `got ${quote(value)}.`,
          );
        }
        break;
      case "<>":
        if (value === limit) {
          throw new TypeError(
            `Invalid value for property [${name}]. ` + //
              `Expected a value not equal to ${limit}.`,
          );
        }
        break;
    }
  }
}

function checkString(prop: StringPropSchema, name: string, value: unknown): void {
  if (typeof value !== "string") {
    throw new TypeError(
      `Invalid value for property [${name}]. ` + //
        `Expected a string, got ${quote(value)}.`,
    );
  }
  const { range = [] } = prop;
  if (range.length > 0 && !range.includes(value)) {
    throw new TypeError(
      `Invalid value for property [${name}]. ` + //
        `Expected one of ${range.map((v) => quote(v)).join(", ")}, ` +
        `got ${quote(value)}.`,
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
