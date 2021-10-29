import type { DeviceParams } from "../circuit/params";
import type { BinaryExp, Equation, Expression, FuncExp, UnaryExp } from "./ast";
import { builtins, equation, literalExp, Parameter } from "./ast";
import { callFunc } from "./functions";

export class Variables {
  private equations = new Map<string, Equation>();

  constructor() {
    for (const builtin of builtins) {
      this.setEquation(builtin);
    }
  }

  setVariable(name: string, value: number): void {
    this.setEquation(equation(name, literalExp(value)));
  }

  setEquation(equation: Equation): void {
    this.equations.set(equation.id.name, equation);
  }

  mapParams(params: readonly Parameter[]): DeviceParams {
    const result: Record<string, number | string> = {};
    for (const { id, value } of params) {
      switch (value.type) {
        case "string":
          result[id.name] = value.value;
          break;
        case "exp":
          result[id.name] = this.evalExp(value.value);
      }
    }
    return result;
  }

  lookup(name: string): number {
    const eq = this.equations.get(name);
    if (eq == null) {
      throw new TypeError(`Equation [${name}] is not defined.`);
    }
    return this.evalExp(eq.value);
  }

  evalExp(exp: Expression): number {
    switch (exp.type) {
      case "literal": {
        return exp.value;
      }
      case "var": {
        return this.lookup(exp.id.name);
      }
      case "unary": {
        return this._evalUnaryExp(exp);
      }
      case "binary": {
        return this._evalBinaryExp(exp);
      }
      case "func": {
        return this._evalFuncExp(exp);
      }
    }
  }

  private _evalUnaryExp(exp: UnaryExp): number {
    const arg = this.evalExp(exp.arg);
    switch (exp.op) {
      case "+":
        return arg;
      case "-":
        return -arg;
    }
  }

  private _evalBinaryExp(exp: BinaryExp): number {
    const a = this.evalExp(exp.arg1);
    const b = this.evalExp(exp.arg2);
    switch (exp.op) {
      case "+": {
        return a + b;
      }
      case "-": {
        return a - b;
      }
      case "*": {
        return a * b;
      }
      case "/": {
        return a / b;
      }
      case "^": {
        return Math.pow(a, b);
      }
    }
  }

  private _evalFuncExp(exp: FuncExp): number {
    return callFunc(
      exp.id.name,
      exp.args.map((arg) => this.evalExp(arg)),
    );
  }
}
