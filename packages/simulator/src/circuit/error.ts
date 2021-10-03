export class CircuitError extends Error {
  override readonly name = "CircuitError";

  constructor(message?: string) {
    super(message);
  }
}
