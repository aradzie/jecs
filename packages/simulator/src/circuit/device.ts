import { Props, type PropsSchema } from "../props/index.js";
import { type ComplexStamper, type RealStamper } from "./mna.js";
import { type Network, type Node } from "./network.js";
import { type Diff, type DiffOwner } from "./transient.js";

export type DeviceClass = {
  /** Unique device class identifier. */
  readonly id: string;
  /** The number of terminals in the device. */
  readonly numTerminals: number;
  /** Schema of the device parameters. */
  readonly propsSchema: PropsSchema;
  /** Schema of the device state vector. */
  readonly stateSchema: StateSchema;
  /** Whether this device is linear. */
  readonly linear: boolean;
  /**
   * Device constructor.
   * @param id Unique device instance identifier.
   */
  new (id: string): Device;
};

/**
 * Device states are kept in typed arrays.
 */
export type DeviceState = Float64Array;

export type OutputParam = {
  /** Element index. */
  readonly index: number;
  /** Output parameter name. */
  readonly name: string;
  /** Output parameter unit. */
  readonly unit: string;
};

export type StateSchema = {
  /** Length of the state vector. */
  readonly length: number;
  /** Output parameters from the state vector. */
  readonly ops: readonly OutputParam[];
};

export type DcParams = {
  /** The default temperature of devices. */
  readonly temp: number;
  /** Voltage or current source value multiplier for the convergence helper. */
  readonly sourceFactor: number;
};

export type TrParams = DcParams & {
  /** Elapsed simulation time. */
  readonly time: number;
};

export abstract class Device implements DiffOwner {
  static readonly dummy = new (class Dummy extends Device {
    static override readonly id = "DUMMY";
    static override readonly numTerminals = 0;
    static override readonly propsSchema = {};
    static override readonly stateSchema = {
      length: 0,
      ops: [],
    };

    constructor() {
      super("DUMMY");
    }
  })();

  /** Unique device class identifier. */
  static readonly id: string;

  /** The number of terminals in the device. */
  static readonly numTerminals: number;

  /** Schema of the device parameters. */
  static readonly propsSchema: PropsSchema;

  /** Schema of the device state vector. */
  static readonly stateSchema: StateSchema;

  /** Whether this device is linear. Most devices are linear. */
  static readonly linear: boolean = true;

  /** A device whose TR behavior is the same as DC behavior. */
  static readonly Dc = class DcDevice extends Device {
    override initTr(props: Props, state: DeviceState, params: TrParams) {
      this.initDc(props, state, params);
    }

    override loadTr(state: DeviceState, params: TrParams, stamper: RealStamper) {
      this.loadDc(state, params, stamper);
    }

    override endTr(state: DeviceState, params: TrParams) {
      this.endDc(state, params);
    }
  };

  /** Unique device instance identifier. */
  readonly id: string;

  /** Device properties. */
  readonly props: Props;

  /** Vector with device state variables. */
  readonly state: DeviceState;

  /** Transient device behaviors. */
  readonly diffs: Diff[] = [];

  constructor(id: string) {
    this.id = id;
    const { propsSchema, stateSchema } = this.deviceClass;
    this.props = new Props(propsSchema);
    this.state = new Float64Array(stateSchema.length);
  }

  get deviceClass(): DeviceClass {
    return this.constructor as DeviceClass;
  }

  /**
   * Circuit calls this method to let a device allocate extra nodes and
   * branches.
   * @param network A network which contains allocated nodes and branches.
   * @param nodes Circuit nodes to which the device terminals are connected.
   */
  connect(network: Network, nodes: readonly Node[]): void {}

  init(props: Props, state: DeviceState): void {}

  initDc(props: Props, state: DeviceState, params: DcParams): void {}

  loadDc(state: DeviceState, params: DcParams, stamper: RealStamper): void {}

  endDc(state: DeviceState, params: DcParams): void {}

  initTr(props: Props, state: DeviceState, params: TrParams): void {}

  loadTr(state: DeviceState, params: TrParams, stamper: RealStamper): void {}

  endTr(state: DeviceState, params: TrParams): void {}

  initAc(props: Props, state: DeviceState): void {}

  loadAc(state: DeviceState, frequency: number, stamper: ComplexStamper): void {}

  endAc(state: DeviceState): void {}
}
