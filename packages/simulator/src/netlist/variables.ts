import type {
  BinaryExpNode,
  EquationItemNode,
  ExpressionNode,
  FuncExpNode,
  PropertyValue,
  UnaryExpNode,
} from "./ast.js";
import { builtins, equation, literalExp } from "./ast.js";
import { callFunc } from "./functions.js";

export class Variables {
  private equations = new Map<string, EquationItemNode>();

  constructor() {
    for (const builtin of builtins) {
      this.setEquation(builtin);
    }
  }

  setVariable(name: string, value: number): void {
    this.setEquation(equation(name, literalExp(value)));
  }

  setEquation(equation: EquationItemNode): void {
    this.equations.set(equation.id.name, equation);
  }

  getValue({ type, value }: PropertyValue): number | string {
    switch (type) {
      case "string":
        return value;
      case "exp":
        return this.evalExp(value);
    }
  }

  lookup(name: string): number {
    const eq = this.equations.get(name);
    if (eq == null) {
      throw new TypeError(`Equation [${name}] is not defined.`);
    }
    return this.evalExp(eq.value);
  }

  evalExp(exp: ExpressionNode): number {
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

  private _evalUnaryExp(exp: UnaryExpNode): number {
    const arg = this.evalExp(exp.arg);
    switch (exp.op) {
      case "+":
        return arg;
      case "-":
        return -arg;
    }
  }

  private _evalBinaryExp(exp: BinaryExpNode): number {
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

  private _evalFuncExp(exp: FuncExpNode): number {
    return callFunc(
      exp.id.name,
      exp.args.map((arg) => this.evalExp(arg)),
    );
  }
}
