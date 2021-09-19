import type { Network, Node, Stamper } from "../network";

// pin
// two-terminal, three-terminal, etc
// one-port
// two-port

export interface DeviceClass {
  readonly id: string;
  readonly numTerminals: number;
  new (...args: any[]): Device;
}

export interface DeviceProps {
  readonly name: string;
}

export abstract class Device {
  static readonly id: string;
  static readonly numTerminals: number;

  readonly nodes: Node[];
  readonly name: string;

  constructor(nodes: readonly Node[], name: string) {
    this.nodes = [...nodes];
    this.name = name;
  }

  /**
   * Circuit call this method to let a device
   * to allocate extra nodes and branches.
   * @param network A network which contains allocated nodes and branches.
   */
  connect(network: Network): void {}

  /**
   * Circuit calls this method to let a device
   * to stamp MAN matrix and RHS vector.
   * @param stamper A stamper which updates MNA matrix and RHS vector.
   */
  stamp(stamper: Stamper): void {}

  update(): void {}
}
