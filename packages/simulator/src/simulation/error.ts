export class SimulationError extends Error {
  override name = "SimulationError";

  constructor(message: string) {
    super(message);
  }
}

export class ConvergenceError extends SimulationError {
  override name = "ConvergenceError";

  constructor(message: string) {
    super(message);
  }
}
