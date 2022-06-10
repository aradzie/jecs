export class NetlistError extends Error {
  override name = "NetlistError";

  constructor(message: string) {
    super(message);
  }
}
