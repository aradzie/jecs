const builtinPos = Object.freeze<Position>({
  offset: 0,
  line: 0,
  column: 0,
});
const builtinLocation = Object.freeze<Location>({
  start: builtinPos,
  end: builtinPos,
});

export interface Position {
  readonly offset: number;
  readonly line: number;
  readonly column: number;
}

export interface Location {
  readonly start: Position;
  readonly end: Position;
}

export interface HasLocation {
  readonly location: Location;
}

export interface HasId {
  readonly id: Identifier;
}

export interface Node {}

export interface NetlistNode extends Node {
  readonly items: readonly ItemNode[];
}

export interface Identifier extends Node {
  readonly name: string;
}

export type ItemNode =
  | InstanceItemNode
  | ModelItemNode
  | EquationItemNode
  | DcItemNode
  | TranItemNode;

export interface InstanceItemNode extends Node {
  readonly type: "instance";
  readonly deviceId: Identifier;
  readonly modelId: Identifier | null;
  readonly instanceId: Identifier | null;
  readonly nodes: readonly Identifier[];
  readonly properties: readonly PropertyNode[];
}

export interface ModelItemNode extends Node, HasId {
  readonly type: "model";
  readonly deviceId: Identifier;
  readonly modelId: Identifier;
  readonly properties: readonly PropertyNode[];
}

export interface PropertyNode extends Node, HasId {
  readonly id: Identifier;
  readonly value: PropertyValue;
}

export type PropertyValue = StringPropertyValue | ExpPropertyValue;

export interface StringPropertyValue {
  readonly type: "string";
  readonly value: string;
}

export interface ExpPropertyValue {
  readonly type: "exp";
  readonly value: ExpressionNode;
}

export interface EquationItemNode extends Node, HasId {
  readonly type: "equation";
  readonly id: Identifier;
  readonly value: ExpressionNode;
}

export interface DcItemNode extends Node {
  readonly type: "dc";
  readonly properties: readonly PropertyNode[];
  readonly sweeps: readonly SweepNode[];
}

export interface TranItemNode extends Node {
  readonly type: "tran";
  readonly properties: readonly PropertyNode[];
  readonly sweeps: readonly SweepNode[];
}

export interface SweepNode extends Node {
  readonly variable: string;
  readonly from: number;
  readonly to: number;
  readonly points: number;
}

export type ExpressionNode =
  | UnaryExpNode
  | BinaryExpNode
  | LiteralExpNode
  | VarExpNode
  | FuncExpNode;

export interface UnaryExpNode extends Node {
  readonly type: "unary";
  readonly op: "+" | "-";
  readonly arg: ExpressionNode;
}

export interface BinaryExpNode extends Node {
  readonly type: "binary";
  readonly op: "+" | "-" | "*" | "/" | "^";
  readonly arg1: ExpressionNode;
  readonly arg2: ExpressionNode;
}

export interface LiteralExpNode extends Node {
  readonly type: "literal";
  readonly value: number;
}

export interface VarExpNode extends Node, HasId {
  readonly type: "var";
  readonly id: Identifier;
}

export interface FuncExpNode extends Node, HasId {
  readonly type: "func";
  readonly id: Identifier;
  readonly args: readonly ExpressionNode[];
}

export function equation(name: string, value: ExpressionNode): EquationItemNode {
  return {
    type: "equation",
    id: { name },
    value,
  };
}

export function literalExp(value: number): LiteralExpNode {
  return { type: "literal", value };
}

export const builtins: readonly EquationItemNode[] = [
  equation("$PI", literalExp(Math.PI)),
  equation("$E", literalExp(Math.E)),
];
