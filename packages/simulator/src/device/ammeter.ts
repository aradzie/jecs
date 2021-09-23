import { Device } from "../simulation/device";
import type { Branch, Network, Node, Stamper } from "../simulation/network";

/**
 * Ammeter.
 */
export class Ammeter extends Device {
  static override readonly id = "ammeter";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = [];

  /** Negative terminal. */
  readonly a: Node;
  /** Positive terminal. */
  readonly b: Node;
  /** Extra MNA branch. */
  branch!: Branch;
  /** Current through device. */
  current = 0;

  constructor(
    name: string, //
    [a, b]: readonly Node[],
  ) {
    super(name, [a, b]);
    this.a = a;
    this.b = b;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.a, this.b);
  }

  override stamp(stamper: Stamper): void {
    stamper.stampMatrix(this.a, this.branch, 1);
    stamper.stampMatrix(this.b, this.branch, -1);
    stamper.stampMatrix(this.branch, this.a, 1);
    stamper.stampMatrix(this.branch, this.b, -1);
  }

  override update(): void {
    this.current = this.branch.current;
  }
}
