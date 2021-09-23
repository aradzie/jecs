import { solve } from "../math/gauss-elimination";
import { matMake, vecMake } from "../math/matrix";
import type { Circuit } from "./circuit";
import { CircuitError } from "./error";
import { Branch, makeStamper, Node } from "./network";

export type DcAnalysisResult = Map<string, number>;

export function dcAnalysis(circuit: Circuit): DcAnalysisResult {
  const { groundNode, nodes, devices } = circuit;

  if (devices.length === 0) {
    throw new CircuitError(`Empty circuit`);
  }

  const n = nodes.length;
  const matrix = matMake(n, n);
  const rhs = vecMake(n);

  const stamper = makeStamper(groundNode, matrix, rhs);

  for (const device of devices) {
    device.stamp(stamper);
  }

  const x = solve(matrix, rhs);

  circuit.updateDevices(x);

  return makeResult([groundNode, ...nodes]);
}

function makeResult(nodes: readonly (Node | Branch)[]): DcAnalysisResult {
  const result = new Map<string, number>();
  for (const node of nodes) {
    if (node instanceof Node) {
      result.set(`V[${node.name}]`, node.voltage);
      continue;
    }
    if (node instanceof Branch) {
      result.set(`I[${node.a.name}->${node.b.name}]`, node.current);
      continue;
    }
  }
  return result;
}
