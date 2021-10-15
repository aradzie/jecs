import type { Op } from "@jssim/simulator/lib/circuit/ops";

export function op(details: readonly Op[], name: string): number {
  for (const detail of details) {
    if (detail.name === name) {
      return detail.value;
    }
  }
  throw new TypeError();
}
