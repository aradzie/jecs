export class Logger {
  numSimulations = 0;
  numIterations = 0;

  reset(): void {
    this.numSimulations = 0;
    this.numIterations = 0;
  }

  simulationStarted(): void {
    this.numSimulations += 1;
  }

  simulationEnded(): void {}

  iterationStarted(): void {
    this.numIterations += 1;
  }

  iterationEnded(): void {}

  toString(): string {
    return JSON.stringify(this, null, 2);
  }

  toJSON(): unknown {
    const { numSimulations, numIterations } = this;
    return {
      numSimulations,
      numIterations,
    };
  }
}

export const logger = new Logger();
