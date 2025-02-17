import { type Point } from "../graphics/geometry.ts";
import { conductors } from "../library/conductors.ts";
import { nonlinear } from "../library/nonlinear.ts";
import { sources } from "../library/sources.ts";
import { type Element } from "./element.ts";
import { Instance } from "./instance.ts";
import { Node } from "./node.ts";
import { Pin } from "./pin.ts";
import { Wire } from "./wire.ts";

export type Network = {
  readonly pins: readonly Pin[];
  readonly joins: readonly Point[];
  readonly nodes: readonly Node[];
  /** Gets all wires connected to a point at the given grid position. */
  getWires(x: number, y: number): Wire[] | null;
  /** Gets all pins connected to a point at the given grid position. */
  getPins(x: number, y: number): Pin[] | null;
};

export function dummyNetwork(): Network {
  const pins = [] as Pin[];
  const joins = [] as Point[];
  const nodes = [] as Node[];
  return new (class implements Network {
    get pins() {
      return pins;
    }
    get joins() {
      return joins;
    }
    get nodes() {
      return nodes;
    }
    getWires() {
      return null;
    }
    getPins() {
      return null;
    }
  })();
}

export function connect(elements: Iterable<Element>): Network {
  const pins = [] as Pin[];
  const joins = [] as Point[];
  const nodes = [] as Node[];
  const cells = new Map<number, Cell>();
  const graph = new WireGraph(cells, joins, nodes);
  for (const element of elements) {
    if (element instanceof Instance) {
      for (const [name, px, py] of element.pins) {
        const x = element.x + px;
        const y = element.y + py;
        const pin = new Pin(x, y, element, name);
        pins.push(pin);
        graph.addPin(pin);
      }
      continue;
    }
    if (element instanceof Wire) {
      graph.addWire(element);
    }
  }
  // Create nodes from connected wires.
  graph.connect();
  return new (class implements Network {
    get pins() {
      return pins;
    }
    get joins() {
      return joins;
    }
    get nodes() {
      return nodes;
    }
    getWires(x: number, y: number) {
      return cells.get(cellKey(x, y))?.wires ?? null;
    }
    getPins(x: number, y: number) {
      return cells.get(cellKey(x, y))?.pins ?? null;
    }
  })();
}

/**
 * Spatial wire graph vertex.
 */
type Cell = {
  /** Cell position on the grid. */
  x: number;
  /** Cell position on the grid. */
  y: number;
  /** Incident wires, wires that begin or end at this cell. */
  wires: Wire[];
  /** Device pins at this cell. */
  pins: Pin[];
  /**
   * All connected wires and pins have the same color
   * and therefore belong to the same node.
   */
  color: Color | null;
};

/**
 * Mutable node builder that is shared between graph cells.
 */
type Color = {
  /** The shared node to be updated with new wires and pins. */
  node: Node;
  /** A mutable list of wires, grounds and ports that is owned by the node. */
  elements: Element[];
  /** A mutable list of pins that is owned by the node. */
  pins: Pin[];
};

const suggestions = new Set([
  sources.vdc,
  sources.idc,
  nonlinear.opamp,
  nonlinear.npn,
  nonlinear.pnp,
  nonlinear.nmos,
  nonlinear.pmos,
  nonlinear.nfet,
  nonlinear.pfet,
]);

/**
 * A spatial graph of wires.
 */
class WireGraph {
  readonly cells: Map<number, Cell>;
  readonly joins: Point[];
  readonly nodes: Node[];
  readonly names: Set<string>;

  constructor(cells: Map<number, Cell>, joins: Point[], nodes: Node[]) {
    this.cells = cells;
    this.joins = joins;
    this.nodes = nodes;
    this.names = new Set(["ground"]);
  }

  addPin(pin: Pin) {
    this.getCell(pin.x, pin.y).pins.push(pin);
  }

  addWire(wire: Wire) {
    this.getCell(wire.x0, wire.y0).wires.push(wire);
    this.getCell(wire.x1, wire.y1).wires.push(wire);
  }

  getCell(x: number, y: number) {
    const key = cellKey(x, y);
    let cell = this.cells.get(key);
    if (cell == null) {
      this.cells.set(key, (cell = { x, y, wires: [], pins: [], color: null }));
    }
    return cell;
  }

  connect() {
    // Ground and port devices define node names.
    this.connectGrounds();
    this.connectPorts();
    this.connectWithSuggestedNames();
    // Connect the remaining nodes, create unique node names.
    let count = 1;
    for (const cell of this.cells.values()) {
      if (cell.pins.length > 0 && cell.color == null) {
        this.walk([cell], this.getColor(this.getUniqueName(`_n${count}`)));
        count += 1;
      }
    }
    // Find all the points where wires and pins connect
    // and paint them as dots.
    for (const cell of this.cells.values()) {
      if (cell.wires.length + cell.pins.length > 2) {
        this.joins.push({ x: cell.x, y: cell.y });
      }
    }
  }

  connectGrounds() {
    // Create a node named `ground`.
    const color = this.getColor("ground");
    for (const cell of this.cells.values()) {
      for (const pin of cell.pins) {
        if (pin.instance.symbol === conductors.ground) {
          // A ground device is connected to this pin.
          color.elements.push(pin.instance);
          if (cell.color == null) {
            this.walk([cell], color);
          } else if (cell.color !== color) {
            // Conflict!!! Must be an uncolored cell.
            this.conflict(color, cell);
            return;
          }
        }
      }
    }
  }

  connectPorts() {
    // Create nodes named after the port names.
    const colors = new Map<string, Color>();
    for (const cell of this.cells.values()) {
      for (const pin of cell.pins) {
        if (pin.instance.symbol === conductors.port) {
          // A port device is connected to this pin.
          const { name } = pin.instance;
          this.names.add(name);
          let color = colors.get(name);
          if (color == null) {
            colors.set(name, (color = this.getColor(name)));
          }
          color.elements.push(pin.instance);
          if (cell.color == null) {
            this.walk([cell], color);
          } else if (cell.color !== color) {
            // Conflict!!! Must be an uncolored cell.
            this.conflict(color, cell);
            return;
          }
        }
      }
    }
  }

  connectWithSuggestedNames() {
    // Create nodes named after the instance and pin names.
    for (const cell of this.cells.values()) {
      for (const pin of cell.pins) {
        if (suggestions.has(pin.instance.symbol)) {
          if (cell.color == null) {
            const suggestedName = `_${pin.instance.name}_${pin.name}`;
            this.walk([cell], this.getColor(this.getUniqueName(suggestedName)));
          }
        }
      }
    }
  }

  conflict(color: Color, cell: Cell) {
    console.warn(`Node naming conflict: [${color.node.name}] and [${cell.color!.node.name}]`);
    this.nodes.length = 0;
  }

  walk(stack: Cell[], color: Color) {
    // Spread the given cell color across all connected wires
    // by doing depth-first search in the wire graph.
    while (true) {
      const cell = stack.pop();
      if (cell == null) {
        break;
      }
      cell.color = color;
      for (const wire of cell.wires) {
        color.elements.push(wire);
        // Go to the other end of the wire.
        const key =
          cell.x === wire.x1 && cell.y === wire.y1
            ? cellKey(wire.x0, wire.y0)
            : cellKey(wire.x1, wire.y1);
        const next = this.cells.get(key);
        if (next != null && next.color == null) {
          stack.push(next);
        }
      }
      for (const pin of cell.pins) {
        color.pins.push(pin);
      }
    }
  }

  getColor(name: string) {
    const elements = [] as Element[];
    const pins = [] as Pin[];
    const node = new Node(name, elements, pins);
    this.nodes.push(node);
    return { node, elements, pins } as Color;
  }

  getUniqueName(name: string): string {
    if (this.names.has(name)) {
      let count = 1;
      while (true) {
        let candidate = `${name}_${count}`;
        if (!this.names.has(candidate)) {
          name = candidate;
          break;
        }
        count += 1;
      }
    }
    this.names.add(name);
    return name;
  }
}

function cellKey(x: number, y: number): number {
  return ((y + 0x8000) << 16) | ((x + 0x8000) << 0);
}
