export interface Position {
  readonly offset: number;
  readonly line: number;
  readonly column: number;
}

export interface Location {
  readonly source: string | undefined;
  readonly start: Position;
  readonly end: Position;
}

export interface HasLocation {
  readonly location: Location;
}

export interface HasId {
  readonly id: Identifier;
}

export interface Node extends HasLocation {}

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
  | TrItemNode
  | AcItemNode;

export interface InstanceItemNode extends Node {
  readonly type: "instance";
  readonly deviceId: Identifier;
  readonly instanceId: Identifier;
  readonly nodes: readonly Identifier[];
  readonly modelId: Identifier | null;
  readonly props: readonly PropNode[];
}

export interface ModelItemNode extends Node, HasId {
  readonly type: "model";
  readonly deviceId: Identifier;
  readonly modelId: Identifier;
  readonly props: readonly PropNode[];
}

export interface PropNode extends Node, HasId {
  readonly id: Identifier;
  readonly value: PropValue;
}

export type PropValue = StringPropValue | ExpPropValue;

export interface StringPropValue {
  readonly type: "string";
  readonly value: string;
}

export interface ExpPropValue {
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
  readonly props: readonly PropNode[];
  readonly sweeps: readonly SweepNode[];
}

export interface TrItemNode extends Node {
  readonly type: "tr";
  readonly props: readonly PropNode[];
  readonly sweeps: readonly SweepNode[];
}

export interface AcItemNode extends Node {
  readonly type: "ac";
  readonly props: readonly PropNode[];
  readonly sweeps: readonly SweepNode[];
}

export interface SweepNode extends Node, HasId {
  readonly type: "sweep";
  readonly id: Identifier;
  readonly props: readonly PropNode[];
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
