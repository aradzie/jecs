export class SimulationError extends Error {
  override readonly name = "SimulationError";

  constructor(message?: string) {
    super(message);
  }
}
