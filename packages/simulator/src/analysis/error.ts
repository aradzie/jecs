export class SimulationError extends Error {
  override name = "SimulationError";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class ConvergenceError extends SimulationError {
  override name = "ConvergenceError";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}
