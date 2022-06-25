const defs = new Map<string, FunctionDef>([]);

export class FunctionDef {
  static add({
    name,
    reqArgs = 1,
    optArgs = 0,
    varArgs = false,
    fn,
  }: {
    readonly name: string;
    readonly reqArgs?: number;
    readonly optArgs?: number;
    readonly varArgs?: boolean;
    readonly fn: (...args: number[]) => number;
  }): void {
    defs.set(name, new FunctionDef(name, reqArgs, optArgs, varArgs, fn));
  }

  static get(name: string): FunctionDef {
    const def = defs.get(name);
    if (def == null) {
      throw new TypeError(`Unknown function [${name}]`);
    }
    return def;
  }

  constructor(
    readonly name: string,
    readonly reqArgs: number,
    readonly optArgs: number,
    readonly varArgs: boolean,
    readonly fn: (...args: number[]) => number,
  ) {}

  call(args: number[]): number {
    const { name, reqArgs, optArgs, varArgs, fn } = this;
    if (reqArgs > args.length) {
      throw new TypeError(`Too few arguments to function [${name}]`);
    }
    if (!varArgs && reqArgs + optArgs < args.length) {
      throw new TypeError(`Too many arguments to function [${name}]`);
    }
    return fn(...args);
  }
}

FunctionDef.add({ name: "abs", fn: Math.abs });
FunctionDef.add({ name: "sin", fn: Math.sin });
FunctionDef.add({ name: "asin", fn: Math.asin });
FunctionDef.add({ name: "cos", fn: Math.cos });
FunctionDef.add({ name: "acos", fn: Math.acos });
FunctionDef.add({ name: "tan", fn: Math.tan });
FunctionDef.add({ name: "atan", fn: Math.atan });
FunctionDef.add({ name: "exp", fn: Math.exp });
FunctionDef.add({ name: "log", fn: Math.log });
FunctionDef.add({ name: "log10", fn: Math.log10 });
FunctionDef.add({ name: "sqrt", fn: Math.sqrt });
FunctionDef.add({ name: "pow", fn: Math.pow });
FunctionDef.add({ name: "round", fn: Math.round });
FunctionDef.add({ name: "floor", fn: Math.floor });
FunctionDef.add({ name: "ceil", fn: Math.ceil });
FunctionDef.add({ name: "min", reqArgs: 2, varArgs: true, fn: Math.min });
FunctionDef.add({ name: "max", reqArgs: 2, varArgs: true, fn: Math.max });
FunctionDef.add({ name: "dB", fn: (v) => 10 * Math.log10(v) });
