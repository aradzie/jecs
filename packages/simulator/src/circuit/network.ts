import { NumericOverflowError } from "@jssim/math/lib/error.js";
import type { Matrix, Vector } from "@jssim/math/lib/types.js";

const { isFinite } = Number;

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
   * Ground node has index -1 and is not a part of the MNA matrix.
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
   * Branch index in the MNA matrix.
   */
  readonly index: number;

  /**
   * First node connected with this branch.
   */
  readonly a: Node;

  /**
   * Second node connected with this branch.
   */
  readonly b: Node;

  /**
   * Computed branch current.
   */
  current = 0;

  constructor(index: number, a: Node, b: Node) {
    this.index = index;
    this.a = a;
    this.b = b;
  }

  toString(): string {
    return `Branch[${this.a}->${this.b}]`;
  }
}

export const groundNode = new Node(-1, "g");

export class Stamper {
  readonly #matrix: Matrix;
  readonly #vector: Vector;

  constructor(matrix: Matrix, vector: Vector) {
    this.#matrix = matrix;
    this.#vector = vector;
  }

  /**
   * Stamps the MNA matrix with the given value.
   * @param i Row index.
   * @param j Column index.
   * @param x Stamp value.
   */
  stampMatrix(i: Node | Branch, j: Node | Branch, x: number): void {
    if (!isFinite(x)) {
      throw new NumericOverflowError();
    }
    if (i !== groundNode && j !== groundNode) {
      this.#matrix[i.index][j.index] += x;
    }
  }

  /**
   * Stamps RHS vector with the given value.
   * @param i Element index.
   * @param x Stamp value.
   */
  stampRightSide(i: Node | Branch, x: number): void {
    if (!isFinite(x)) {
      throw new NumericOverflowError();
    }
    if (i !== groundNode) {
      this.#vector[i.index] += x;
    }
  }

  stampConductance(i: Node, j: Node, x: number): void {
    this.stampMatrix(i, i, x);
    this.stampMatrix(i, j, -x);
    this.stampMatrix(j, i, -x);
    this.stampMatrix(j, j, x);
  }

  stampTransconductance(a: Node, b: Node, i: Node, j: Node, x: number): void {
    this.stampMatrix(a, i, x);
    this.stampMatrix(a, j, -x);
    this.stampMatrix(b, i, -x);
    this.stampMatrix(b, j, x);
  }

  stampVoltageSource(i: Node, j: Node, b: Branch, x: number): void {
    this.stampMatrix(i, b, 1);
    this.stampMatrix(j, b, -1);
    this.stampMatrix(b, i, 1);
    this.stampMatrix(b, j, -1);
    this.stampRightSide(b, x);
  }

  stampCurrentSource(i: Node, j: Node, x: number): void {
    this.stampRightSide(i, -x);
    this.stampRightSide(j, x);
  }
}
