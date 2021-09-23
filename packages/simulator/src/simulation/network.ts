import { MathError } from "../math/error";
import type { Matrix, Vector } from "../math/types";

export interface Network {
  /**
   * The only ground node in the whole circuit.
   */
  readonly groundNode: Node;

  /**
   * Adds a new voltage node to the MNA matrix.
   * @param name Unique node name.
   */
  allocNode(name: string): Node;

  /**
   * Adds a new current branch to the MNA matrix.
   * @param a A first node connected with the branch.
   * @param b A second node connected with the branch.
   */
  allocBranch(a: Node, b: Node): Branch;
}

/**
 * Circuit's node.
 */
export class Node {
  /**
   * Node index in the MNA matrix.
   * Ground node has index -1 and is not a part of the MNA matrix.
   */
  readonly index: number;

  /**
   * Arbitrary node name.
   */
  readonly name: string;

  /**
   * Computed node voltage.
   */
  voltage = 0;

  constructor(index: number, name: string) {
    this.index = index;
    this.name = name;
  }

  toString(): string {
    return `Node[${this.name}]`;
  }
}

/**
 * Circuit's branch.
 */
export class Branch {
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

export interface Stamper {
  /**
   * Stamps the MNA matrix with the given value.
   * @param i Row index.
   * @param j Column index.
   * @param x Stamp value.
   */
  stampMatrix(i: Node | Branch, j: Node | Branch, x: number): void;

  /**
   * Stamps RHS vector with the given value.
   * @param i Element index.
   * @param x Stamp value.
   */
  stampRightSide(i: Node | Branch, x: number): void;
}

export function makeStamper(
  groundNode: Node,
  matrix: Matrix,
  rhs: Vector,
): Stamper {
  return new (class implements Stamper {
    stampMatrix(i: Node | Branch, j: Node | Branch, x: number): void {
      if (!Number.isFinite(x)) {
        throw new MathError();
      }
      if (i !== groundNode && j !== groundNode) {
        matrix[i.index][j.index] += x;
      }
    }

    stampRightSide(i: Node | Branch, x: number): void {
      if (!Number.isFinite(x)) {
        throw new MathError();
      }
      if (i !== groundNode) {
        rhs[i.index] += x;
      }
    }
  })();
}
