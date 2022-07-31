import { NumericOverflowError } from "@jecs/math/lib/error.js";
import type { Matrix, Vector } from "@jecs/math/lib/types.js";
import { Branch, groundNode, Node } from "./network.js";

export class Stamper {
  private readonly A: Matrix;
  private readonly b: Vector;

  constructor(matrix: Matrix, vector: Vector) {
    this.A = matrix;
    this.b = vector;
  }

  /**
   * Stamps the MNA matrix with the given value.
   * @param i Row index.
   * @param j Column index.
   * @param x Stamp value.
   */
  stampA(i: Node | Branch, j: Node | Branch, x: number): void {
    if (!Number.isFinite(x)) {
      throw new NumericOverflowError();
    }
    if (i !== groundNode && j !== groundNode) {
      this.A[i.index][j.index] += x;
    }
  }

  /**
   * Stamps RHS vector with the given value.
   * @param i Element index.
   * @param x Stamp value.
   */
  stampB(i: Node | Branch, x: number): void {
    if (!Number.isFinite(x)) {
      throw new NumericOverflowError();
    }
    if (i !== groundNode) {
      this.b[i.index] += x;
    }
  }
}

export class AcStamper {
  private readonly A: Matrix;
  private readonly b: Vector;

  constructor(matrix: Matrix, vector: Vector) {
    this.A = matrix;
    this.b = vector;
  }

  /**
   * Stamps the MNA matrix with the given complex value.
   * @param i Row index.
   * @param j Column index.
   * @param xr Real stamp value.
   * @param xi Imaginary stamp value.
   */
  stampA(i: Node | Branch, j: Node | Branch, xr: number, xi: number): void {
    if (!Number.isFinite(xr)) {
      throw new NumericOverflowError();
    }
    if (!Number.isFinite(xi)) {
      throw new NumericOverflowError();
    }
    if (i !== groundNode && j !== groundNode) {
      const r = i.index * 2;
      const c = j.index * 2;
      this.A[r][c] += xr;
      this.A[r][c + 1] -= xi;
      this.A[r + 1][c] += xi;
      this.A[r + 1][c + 1] += xr;
    }
  }

  /**
   * Stamps RHS vector with the given complex value.
   * @param i Element index.
   * @param xr Real stamp value.
   * @param xi Imaginary stamp value.
   */
  stampB(i: Node | Branch, xr: number, xi: number): void {
    if (!Number.isFinite(xr)) {
      throw new NumericOverflowError();
    }
    if (!Number.isFinite(xi)) {
      throw new NumericOverflowError();
    }
    if (i !== groundNode) {
      const r = i.index * 2;
      this.b[r] += xr;
      this.b[r + 1] += xi;
    }
  }
}

export function stampConductance(s: Stamper, i: Node, j: Node, x: number): void {
  s.stampA(i, i, x);
  s.stampA(i, j, -x);
  s.stampA(j, i, -x);
  s.stampA(j, j, x);
}

export function stampConductanceAc(s: AcStamper, i: Node, j: Node, xr: number, xi: number): void {
  s.stampA(i, i, xr, xi);
  s.stampA(i, j, -xr, -xi);
  s.stampA(j, i, -xr, -xi);
  s.stampA(j, j, xr, xi);
}

export function stampTransconductance(
  s: Stamper,
  a: Node,
  b: Node,
  i: Node,
  j: Node,
  x: number,
): void {
  s.stampA(a, i, x);
  s.stampA(a, j, -x);
  s.stampA(b, i, -x);
  s.stampA(b, j, x);
}

export function stampVoltageSource(s: Stamper, i: Node, j: Node, b: Branch, x: number): void {
  s.stampA(i, b, 1);
  s.stampA(j, b, -1);
  s.stampA(b, i, 1);
  s.stampA(b, j, -1);
  s.stampB(b, x);
}

export function stampVoltageSourceAc(
  s: AcStamper,
  i: Node,
  j: Node,
  b: Branch,
  xr: number,
  xi: number,
): void {
  s.stampA(i, b, 1, 0);
  s.stampA(j, b, -1, 0);
  s.stampA(b, i, 1, 0);
  s.stampA(b, j, -1, 0);
  s.stampB(b, xr, xi);
}

export function stampCurrentSource(s: Stamper, i: Node, j: Node, x: number): void {
  s.stampB(i, -x);
  s.stampB(j, x);
}

export function stampCurrentSourceAc(s: AcStamper, i: Node, j: Node, xr: number, xi: number): void {
  s.stampB(i, -xr, -xi);
  s.stampB(j, xr, xi);
}
