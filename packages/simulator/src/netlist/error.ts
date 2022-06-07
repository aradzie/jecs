export class NetlistError extends Error {
  override readonly name = "NetlistError";

  constructor(message: string) {
    super(message);
  }
}
