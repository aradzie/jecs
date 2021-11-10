export function assert(b: boolean): void {
  if (!b) {
    throw new AssertError(`Assertion failed`);
  }
}

export class AssertError extends Error {
  override name = "AssertError";

  constructor(message: string) {
    super(message);
  }
}
