export class MathError extends Error {
  override name = "MathError";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class NumericOverflowError extends MathError {
  override name = "NumericOverflowError";

  constructor(options?: ErrorOptions) {
    super(`Numeric overflow`, options);
  }
}

export class DivisionByZeroError extends MathError {
  override name = "DivisionByZeroError";

  constructor(options?: ErrorOptions) {
    super(`Division by zero`, options);
  }
}

export class SingularMatrixError extends MathError {
  override name = "SingularMatrixError";

  constructor(options?: ErrorOptions) {
    super(`Singular matrix`, options);
  }
}
