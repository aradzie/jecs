export interface Network {
  /**
   * The only ground node in the whole circuit.
   */
  readonly groundNode: Node;

  /**
   * Adds a new voltage node to the MNA matrix.
   * @param id Unique node id.
   */
  makeNode(id: string): Node;

  /**
   * Adds a new current branch to the MNA matrix.
   * @param a A first node connected with the branch.
   * @param b A second node connected with the branch.
   */
  makeBranch(a: Node, b: Node): Branch;
}

/**
 * Circuit's node.
 */
export class Node {
  readonly type = "node" as const;

  /**
   * Node index in the MNA matrix.
   * Ground node has the index -1 and is not a part of the MNA matrix.
   */
  readonly index: number;

  /**
   * Unique node id.
   */
  readonly id: string;

  /**
   * Computed node voltage.
   */
  voltage = 0;

  /**
   * Computed node AC phase.
   */
  phase = 0;

  constructor(index: number, id: string) {
    this.index = index;
    this.id = id;
  }

  toString(): string {
    return `Node[${this.id}]`;
  }
}

/**
 * Circuit's branch.
 */
export class Branch {
  readonly type = "branch" as const;

  /**
   * A branch index in the MNA matrix.
   */
  readonly index: number;

  /**
   * The first node connected with this branch.
   */
  readonly a: Node;

  /**
   * The second node connected with this branch.
   */
  readonly b: Node;

  /**
   * Computed branch current.
   */
  current = 0;

  /**
   * Computed branch AC phase.
   */
  phase = 0;

  constructor(index: number, a: Node, b: Node) {
    this.index = index;
    this.a = a;
    this.b = b;
  }

  toString(): string {
    return `${this.a}~${this.b}`;
  }
}

export const groundNode = new Node(-1, "gnd");
