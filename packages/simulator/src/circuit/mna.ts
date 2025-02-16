import { Matrix, NumericOverflowError, Vector } from "@jecs/math";
import { Branch, groundNode, Node } from "./network.js";

/**
 * Stamps a matrix of real values.
 */
export class RealStamper {
  private readonly A: Matrix;
  private readonly b: Vector;

  constructor(A: Matrix, b: Vector) {
    this.A = A;
    this.b = b;
  }

  /**
   * Stamps the MNA matrix with the given value.
   * @param n1 Row index.
   * @param n2 Column index.
   * @param v Stamp value.
   */
  stampA(n1: Node | Branch, n2: Node | Branch, v: number): void {
    if (!Number.isFinite(v)) {
      throw new NumericOverflowError();
    }
    if (n1 !== groundNode && n2 !== groundNode) {
      this.A[n1.index][n2.index] += v;
    }
  }

  /**
   * Stamps RHS vector with the given value.
   * @param n1 Element index.
   * @param v Stamp value.
   */
  stampB(n1: Node | Branch, v: number): void {
    if (!Number.isFinite(v)) {
      throw new NumericOverflowError();
    }
    if (n1 !== groundNode) {
      this.b[n1.index] += v;
    }
  }

  // Helpers.

  stampConductance(n1: Node, n2: Node, v: number): void {
    this.stampA(n1, n1, v);
    this.stampA(n1, n2, -v);
    this.stampA(n2, n1, -v);
    this.stampA(n2, n2, v);
  }

  stampTransconductance(n1: Node, n2: Node, n3: Node, n4: Node, v: number): void {
    this.stampA(n1, n3, v);
    this.stampA(n1, n4, -v);
    this.stampA(n2, n3, -v);
    this.stampA(n2, n4, v);
  }

  stampVoltageSource(n1: Node, n2: Node, n3: Branch, v: number): void {
    this.stampA(n1, n3, 1);
    this.stampA(n2, n3, -1);
    this.stampA(n3, n1, 1);
    this.stampA(n3, n2, -1);
    this.stampB(n3, v);
  }

  stampCurrentSource(n1: Node, n2: Node, v: number): void {
    this.stampB(n1, -v);
    this.stampB(n2, v);
  }
}

/**
 * Stamps a matrix of complex values.
 */
export class ComplexStamper {
  private readonly A: Matrix;
  private readonly b: Vector;

  constructor(A: Matrix, b: Vector) {
    this.A = A;
    this.b = b;
  }

  /**
   * Stamps the MNA matrix with the given complex value.
   * @param n1 Row index.
   * @param n2 Column index.
   * @param r Real stamp value.
   * @param i Imaginary stamp value.
   */
  stampA(n1: Node | Branch, n2: Node | Branch, r: number, i: number): void {
    if (!Number.isFinite(r)) {
      throw new NumericOverflowError();
    }
    if (!Number.isFinite(i)) {
      throw new NumericOverflowError();
    }
    if (n1 !== groundNode && n2 !== groundNode) {
      const r = n1.index * 2;
      const c = n2.index * 2;
      this.A[r][c] += r;
      this.A[r][c + 1] -= i;
      this.A[r + 1][c] += i;
      this.A[r + 1][c + 1] += r;
    }
  }

  /**
   * Stamps RHS vector with the given complex value.
   * @param n1 Element index.
   * @param r Real stamp value.
   * @param i Imaginary stamp value.
   */
  stampB(n1: Node | Branch, r: number, i: number): void {
    if (!Number.isFinite(r)) {
      throw new NumericOverflowError();
    }
    if (!Number.isFinite(i)) {
      throw new NumericOverflowError();
    }
    if (n1 !== groundNode) {
      const r = n1.index * 2;
      this.b[r] += r;
      this.b[r + 1] += i;
    }
  }

  // Helpers.

  stampConductance(n1: Node, n2: Node, r: number, i: number): void {
    this.stampA(n1, n1, r, i);
    this.stampA(n1, n2, -r, -i);
    this.stampA(n2, n1, -r, -i);
    this.stampA(n2, n2, r, i);
  }

  stampTransconductance(n1: Node, n2: Node, n3: Node, n4: Node, r: number, i: number): void {
    this.stampA(n1, n3, r, i);
    this.stampA(n1, n4, -r, -i);
    this.stampA(n2, n3, -r, -i);
    this.stampA(n2, n4, r, i);
  }

  stampVoltageSource(n1: Node, n2: Node, n3: Branch, r: number, i: number): void {
    this.stampA(n1, n3, 1, 0);
    this.stampA(n2, n3, -1, 0);
    this.stampA(n3, n1, 1, 0);
    this.stampA(n3, n2, -1, 0);
    this.stampB(n3, r, i);
  }

  stampCurrentSource(n1: Node, n2: Node, r: number, i: number): void {
    this.stampB(n1, -r, -i);
    this.stampB(n2, r, i);
  }
}
