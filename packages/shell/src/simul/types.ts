import type { Location } from "@jecs/simulator/lib/netlist/ast.js";

export type Content = { readonly content: string };

export type Result = OkResult | ErrorResult;

export type OkResult = {
  readonly type: "ok";
  readonly ops: readonly Op[];
};

export type ErrorResult = {
  readonly type: "error";
  readonly error: {
    readonly name: string;
    readonly message: string;
    readonly location: Location | null;
  };
};

export type Op = {
  readonly deviceId: string;
  readonly name: string | null;
  readonly value: number;
  readonly unit: string;
};
