export class CircuitError extends Error {
  override name = "CircuitError";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}
