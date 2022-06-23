export class NetlistError extends Error {
  override name = "NetlistError";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}
