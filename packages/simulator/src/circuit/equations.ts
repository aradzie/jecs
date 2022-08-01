import { DivisionByZeroError, NumericOverflowError } from "@jecs/math/lib/error.js";
import type { Device } from "./device.js";
import { CircuitError } from "./error.js";
import type { FunctionDef } from "./functions.js";

export abstract class Exp {
  abstract eval(eq: Equations): number;

  abstract isConstant(): boolean;

  abstract toString(): string;
}

export class VariableExp extends Exp {
  constructor(readonly name: string) {
    super();
  }

  eval(eq: Equations): number {
    return eq.get(this.name).eval(eq);
  }

  isConstant(): boolean {
    return false;
  }

  override toString(): string {
    return `$${this.name}`;
  }
}

export class ConstantExp extends Exp {
  constructor(readonly value: number) {
    super();
  }

  eval(): number {
    return this.value;
  }

  isConstant(): boolean {
    return true;
  }

  toString(): string {
    return String(this.value);
  }
}

export type UnaryOp = "-" | "+";

export class UnaryExp extends Exp {
  constructor(readonly op: UnaryOp, readonly arg: Exp) {
    super();
  }

  eval(eq: Equations): number {
    const arg = this.arg.eval(eq);
    switch (this.op) {
      case "-":
        return -arg;
      case "+":
        return arg;
    }
  }

  isConstant(): boolean {
    return this.arg.isConstant();
  }

  toString(): string {
    switch (this.op) {
      case "-":
        return `-${this.arg}`;
      case "+":
        return `+${this.arg}`;
    }
  }
}

export type BinaryOp = "-" | "+" | "*" | "/" | "^";

export class BinaryExp extends Exp {
  constructor(readonly op: BinaryOp, readonly arg1: Exp, readonly arg2: Exp) {
    super();
  }

  eval(eq: Equations): number {
    const arg1 = this.arg1.eval(eq);
    const arg2 = this.arg2.eval(eq);
    switch (this.op) {
      case "-":
        return checkNumber(arg1 - arg2);
      case "+":
        return checkNumber(arg1 + arg2);
      case "*":
        return checkNumber(arg1 * arg2);
      case "/":
        if (arg2 === 0) {
          throw new DivisionByZeroError();
        }
        return checkNumber(arg1 / arg2);
      case "^":
        return checkNumber(arg1 ** arg2);
    }
  }

  isConstant(): boolean {
    return this.arg1.isConstant() && this.arg2.isConstant();
  }

  toString(): string {
    return `(${this.arg1} ${this.op} ${this.arg2})`;
  }
}

export class FunctionExp extends Exp {
  constructor(readonly def: FunctionDef, readonly args: readonly Exp[]) {
    super();
  }

  eval(eq: Equations): number {
    return checkNumber(this.def.call(this.args.map((arg) => arg.eval(eq))));
  }

  isConstant(): boolean {
    return this.args.every((arg) => arg.isConstant());
  }

  toString(): string {
    return `${this.def.name}(${this.args.map((arg) => `${arg}`).join(", ")})`;
  }
}

export class Equations implements Iterable<string> {
  readonly #map = new Map<string, Exp>();

  constructor() {
    this.set("pi", new ConstantExp(Math.PI));
    this.set("e", new ConstantExp(Math.E));
  }

  has(name: string): boolean {
    return this.#map.has(name);
  }

  get(name: string): Exp {
    const exp = this.#map.get(name);
    if (exp == null) {
      throw new CircuitError(`Unknown variable [${name}].`);
    }
    return exp;
  }

  set(name: string, exp: Exp): void {
    this.#map.set(name, exp);
  }

  [Symbol.iterator](): Iterator<string> {
    return this.#map.keys();
  }
}

export class Binding {
  constructor(readonly device: Device, readonly name: string, readonly value: Exp) {}

  setProperty(eq: Equations): void {
    try {
      this.device.properties.set(this.name, this.value.eval(eq));
    } catch (err: any) {
      throw new CircuitError(`Cannot configure device [${this.device.id}]: ${err.message}`, {
        // cause: err
      });
    }
  }
}

export class Bindings implements Iterable<Binding> {
  readonly #equations: Equations;
  readonly #list: Binding[];

  constructor(equations: Equations) {
    this.#equations = equations;
    this.#list = [];
  }

  setProperties(): void {
    for (const binding of this.#list) {
      binding.setProperty(this.#equations);
    }
  }

  add(binding: Binding): void {
    this.#list.push(binding);
  }

  [Symbol.iterator](): Iterator<Binding> {
    return this.#list[Symbol.iterator]();
  }
}

function checkNumber(v: number): number {
  if (!Number.isFinite(v)) {
    throw new NumericOverflowError();
  }
  return v;
}
