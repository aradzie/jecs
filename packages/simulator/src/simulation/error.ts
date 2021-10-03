export class CircuitError extends Error {
  override readonly name = "CircuitError";

  constructor(message?: string) {
    super(message);
  }
}

export class SimulationError extends Error {
  override readonly name = "SimulationError";

  constructor(message?: string) {
    super(message);
  }
}
