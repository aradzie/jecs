export class CircuitError extends Error {
  override name = "CircuitError";

  constructor(message: string) {
    super(message);
  }
}
