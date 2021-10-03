import { MathError } from "../math/error";
import type { Matrix, Vector } from "../math/types";
import type { Options } from "./options";

const { isFinite } = Number;
const { abs, max } = Math;

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

export const groundNode = new Node(-1, "GROUND");

export class Stamper {
  readonly #options: Options;
  readonly #matrix: Matrix;
  readonly #vector: Vector;
  #linear = true;
  #converged = true;

  constructor(options: Options, matrix: Matrix, vector: Vector) {
    this.#options = options;
    this.#matrix = matrix;
    this.#vector = vector;
  }

  reset(): void {
    this.#converged = true;
  }

  get options(): Options {
    return this.#options;
  }

  get linear(): boolean {
    return this.#linear;
  }

  get converged(): boolean {
    return this.#converged;
  }

  /**
   * Stamps the MNA matrix with the given value.
   * @param i Row index.
   * @param j Column index.
   * @param x Stamp value.
   */
  stampMatrix(i: Node | Branch, j: Node | Branch, x: number): void {
    if (!isFinite(x)) {
      throw new MathError();
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
      throw new MathError();
    }
    if (i !== groundNode) {
      this.#vector[i.index] += x;
    }
  }

  stampConductance(i: Node | Branch, j: Node | Branch, x: number): void {
    this.stampMatrix(i, i, x);
    this.stampMatrix(i, j, -x);
    this.stampMatrix(j, i, -x);
    this.stampMatrix(j, j, x);
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

  reportVoltageChange(prev: number, curr: number): void {
    this.#linear = false;
    const { vntol, reltol } = this.#options;
    const tol = vntol + reltol * max(abs(prev), abs(curr));
    if (abs(prev - curr) > tol) {
      this.#converged = false;
    }
  }

  reportCurrentChange(prev: number, curr: number): void {
    this.#linear = false;
    const { abstol, reltol } = this.#options;
    const tol = abstol + reltol * max(abs(prev), abs(curr));
    if (abs(prev - curr) > tol) {
      this.#converged = false;
    }
  }
}
