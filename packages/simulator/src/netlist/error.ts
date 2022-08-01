import type { Location } from "./ast.js";

export class NetlistError extends Error {
  override name = "NetlistError";

  readonly location: Location | null;

  constructor(
    message: string,
    options?: ErrorOptions & {
      readonly location?: Location;
    },
  ) {
    super(message, options);
    this.location = options?.location ?? null;
  }
}
