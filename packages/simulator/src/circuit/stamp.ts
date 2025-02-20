import { type Matrix, NumericOverflowError, type Vector } from "@jecs/math";
import { type Branch, groundNode, type Node } from "./network.js";

/**
 * Stamps a matrix of real values.
 */
export class RealStamper {
  readonly #A: Matrix;
  readonly #b: Vector;

  constructor(A: Matrix, b: Vector) {
    this.#A = A;
    this.#b = b;
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
      this.#A[n1.index][n2.index] += v;
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
      this.#b[n1.index] += v;
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
  readonly #A: Matrix;
  readonly #b: Vector;

  constructor(A: Matrix, b: Vector) {
    this.#A = A;
    this.#b = b;
  }

  /**
   * Stamps the MNA matrix with the given complex value.
   * @param n1 Row index.
   * @param n2 Column index.
   * @param vr Real stamp value.
   * @param vi Imaginary stamp value.
   */
  stampA(n1: Node | Branch, n2: Node | Branch, vr: number, vi: number): void {
    if (!Number.isFinite(vr)) {
      throw new NumericOverflowError();
    }
    if (!Number.isFinite(vi)) {
      throw new NumericOverflowError();
    }
    if (n1 !== groundNode && n2 !== groundNode) {
      const r = n1.index * 2;
      const c = n2.index * 2;
      this.#A[r][c] += vr;
      this.#A[r][c + 1] -= vi;
      this.#A[r + 1][c] += vi;
      this.#A[r + 1][c + 1] += vr;
    }
  }

  /**
   * Stamps RHS vector with the given complex value.
   * @param n1 Element index.
   * @param vr Real stamp value.
   * @param vi Imaginary stamp value.
   */
  stampB(n1: Node | Branch, vr: number, vi: number): void {
    if (!Number.isFinite(vr)) {
      throw new NumericOverflowError();
    }
    if (!Number.isFinite(vi)) {
      throw new NumericOverflowError();
    }
    if (n1 !== groundNode) {
      const r = n1.index * 2;
      this.#b[r] += vr;
      this.#b[r + 1] += vi;
    }
  }

  // Helpers.

  stampConductance(n1: Node, n2: Node, vr: number, vi: number): void {
    this.stampA(n1, n1, vr, vi);
    this.stampA(n1, n2, -vr, -vi);
    this.stampA(n2, n1, -vr, -vi);
    this.stampA(n2, n2, vr, vi);
  }

  stampTransconductance(n1: Node, n2: Node, n3: Node, n4: Node, vr: number, vi: number): void {
    this.stampA(n1, n3, vr, vi);
    this.stampA(n1, n4, -vr, -vi);
    this.stampA(n2, n3, -vr, -vi);
    this.stampA(n2, n4, vr, vi);
  }

  stampVoltageSource(n1: Node, n2: Node, n3: Branch, vr: number, vi: number): void {
    this.stampA(n1, n3, 1, 0);
    this.stampA(n2, n3, -1, 0);
    this.stampA(n3, n1, 1, 0);
    this.stampA(n3, n2, -1, 0);
    this.stampB(n3, vr, vi);
  }

  stampCurrentSource(n1: Node, n2: Node, vr: number, vi: number): void {
    this.stampB(n1, -vr, -vi);
    this.stampB(n2, vr, vi);
  }
}
