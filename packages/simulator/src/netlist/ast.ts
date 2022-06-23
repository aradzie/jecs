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
  readonly instanceId: Identifier;
  readonly nodes: readonly Identifier[];
  readonly modelId: Identifier | null;
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
  readonly id: Identifier;
  readonly from: number;
  readonly to: number;
  readonly points: number;
}

export type ExpressionNode =
  | UnaryExpNode
  | BinaryExpNode
  | ConstantExpNode
  | VariableExpNode
  | FunctionExpNode;

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

export interface ConstantExpNode extends Node {
  readonly type: "constant";
  readonly value: number;
}

export interface VariableExpNode extends Node, HasId {
  readonly type: "variable";
  readonly id: Identifier;
}

export interface FunctionExpNode extends Node, HasId {
  readonly type: "function";
  readonly id: Identifier;
  readonly args: readonly ExpressionNode[];
}
