export class MathError extends Error {
  override name = "MathError";

  constructor(message: string) {
    super(message);
  }
}

export class NumericOverflowError extends MathError {
  override name = "NumericOverflowError";

  constructor() {
    super(`Numeric overflow`);
  }
}

export class SingularMatrixError extends MathError {
  override name = "SingularMatrixError";

  constructor() {
    super(`Singular matrix`);
  }
}
