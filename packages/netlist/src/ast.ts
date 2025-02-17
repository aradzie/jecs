export type Position = {
  readonly offset: number;
  readonly line: number;
  readonly column: number;
};

export type Location = {
  readonly source: string | undefined;
  readonly start: Position;
  readonly end: Position;
};

export type HasLocation = {
  readonly location: Location;
};

export type HasId = {
  readonly id: Identifier;
};

export type Node = {} & HasLocation;

export type NetlistNode = {
  readonly items: readonly ItemNode[];
} & Node;

export type Identifier = {
  readonly name: string;
} & Node;

export type ItemNode =
  | InstanceItemNode
  | ModelItemNode
  | EquationItemNode
  | DcItemNode
  | TrItemNode
  | AcItemNode;

export type InstanceItemNode = {
  readonly type: "instance";
  readonly deviceId: Identifier;
  readonly instanceId: Identifier;
  readonly nodes: readonly Identifier[];
  readonly modelId: Identifier | null;
  readonly props: readonly PropNode[];
} & Node;

export type ModelItemNode = {
  readonly type: "model";
  readonly deviceId: Identifier;
  readonly modelId: Identifier;
  readonly props: readonly PropNode[];
} & Node &
  HasId;

export type PropNode = {
  readonly id: Identifier;
  readonly value: PropValue;
} & Node &
  HasId;

export type PropValue = StringPropValue | ExpPropValue;

export type StringPropValue = {
  readonly type: "string";
  readonly value: string;
};

export type ExpPropValue = {
  readonly type: "exp";
  readonly value: ExpressionNode;
};

export type EquationItemNode = {
  readonly type: "equation";
  readonly id: Identifier;
  readonly value: ExpressionNode;
} & Node &
  HasId;

export type DcItemNode = {
  readonly type: "dc";
  readonly props: readonly PropNode[];
  readonly sweeps: readonly SweepNode[];
} & Node;

export type TrItemNode = {
  readonly type: "tr";
  readonly props: readonly PropNode[];
  readonly sweeps: readonly SweepNode[];
} & Node;

export type AcItemNode = {
  readonly type: "ac";
  readonly props: readonly PropNode[];
  readonly sweeps: readonly SweepNode[];
} & Node;

export type SweepNode = {
  readonly type: "sweep";
  readonly id: Identifier;
  readonly props: readonly PropNode[];
} & Node &
  HasId;

export type ExpressionNode =
  | UnaryExpNode
  | BinaryExpNode
  | ConstantExpNode
  | VariableExpNode
  | FunctionExpNode;

export type UnaryExpNode = {
  readonly type: "unary";
  readonly op: "+" | "-";
  readonly arg: ExpressionNode;
} & Node;

export type BinaryExpNode = {
  readonly type: "binary";
  readonly op: "+" | "-" | "*" | "/" | "^";
  readonly arg1: ExpressionNode;
  readonly arg2: ExpressionNode;
} & Node;

export type ConstantExpNode = {
  readonly type: "constant";
  readonly value: number;
} & Node;

export type VariableExpNode = {
  readonly type: "variable";
  readonly id: Identifier;
} & Node &
  HasId;

export type FunctionExpNode = {
  readonly type: "function";
  readonly id: Identifier;
  readonly args: readonly ExpressionNode[];
} & Node &
  HasId;
