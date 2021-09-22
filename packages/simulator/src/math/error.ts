export class MathError extends Error {
  override readonly name = "MathError";

  constructor(message?: string) {
    super(message);
  }
}
