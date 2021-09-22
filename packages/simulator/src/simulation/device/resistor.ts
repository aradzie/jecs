import type { Node, Stamper } from "../network";
import { Device, DeviceProps, Unit } from "./device";

export interface ResistorProps extends DeviceProps {
  readonly r: number;
}

/**
 * Resistor.
 */
export class Resistor extends Device {
  static override readonly id = "r";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = [{ name: "r", unit: Unit.OHM }];

  readonly a: Node;
  readonly b: Node;
  readonly r: number;
  current: number = 0;

  constructor([a, b]: readonly Node[], { name, r }: ResistorProps) {
    super([a, b], name);
    this.a = a;
    this.b = b;
    this.r = r;
  }

  override stamp(stamper: Stamper): void {
    const g = 1.0 / this.r;
    stamper.stampMatrix(this.a, this.a, g);
    stamper.stampMatrix(this.a, this.b, -g);
    stamper.stampMatrix(this.b, this.a, -g);
    stamper.stampMatrix(this.b, this.b, g);
  }

  override update(): void {
    this.current = (this.b.voltage - this.a.voltage) / this.r;
  }
}
