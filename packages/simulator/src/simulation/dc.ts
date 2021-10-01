import { solve } from "../math/gauss-elimination";
import { matMake, vecMake } from "../math/matrix";
import type { Circuit } from "./circuit";
import { CircuitError } from "./error";
import { makeStamper } from "./network";

export function dcAnalysis(circuit: Circuit): void {
  const { groundNode, nodes, devices } = circuit;

  if (devices.length === 0) {
    throw new CircuitError(`Empty circuit`);
  }

  const n = nodes.length;
  const matrix = matMake(n, n);
  const vector = vecMake(n);

  const stamper = makeStamper(groundNode, matrix, vector);

  for (const device of devices) {
    device.stamp(stamper);
  }

  solve(matrix, vector);

  circuit.updateNodes(vector);
}
