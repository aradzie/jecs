import type {
  BinaryExp,
  Equation,
  Expression,
  FuncExp,
  Netlist,
  UnaryExp,
} from "./ast";
import { equation, literalExp } from "./ast";
import { callFunc } from "./functions";

export class Variables {
  private static builtins: readonly Equation[] = [
    equation("$PI", literalExp(Math.PI)),
    equation("$E", literalExp(Math.E)),
  ];

  private equations = new Map<string, Equation>();

  constructor() {
    for (const builtin of Variables.builtins) {
      this.addEquation(builtin);
    }
  }

  addVariable(name: string, value: number): void {
    this.addEquation(equation(name, literalExp(value)));
  }

  addEquation(equation: Equation): void {
    this.equations.set(equation.name.id, equation);
  }

  lookup(id: string): number {
    const eq = this.equations.get(id);
    if (eq == null) {
      throw new TypeError(`Equation [${id}] is not defined.`);
    }
    return this.evalExp(eq.value);
  }

  evalExp(exp: Expression): number {
    switch (exp.type) {
      case "literal": {
        return exp.value;
      }
      case "var": {
        return this.lookup(exp.id.id);
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
    const a = this.evalExp(exp.a);
    const b = this.evalExp(exp.b);
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
      exp.id.id,
      exp.args.map((arg) => this.evalExp(arg)),
    );
  }
}
