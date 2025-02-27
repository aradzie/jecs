import { type Signal, signal } from "@preact/signals";
import { createContext, type RefObject } from "preact";
import { useContext } from "preact/hooks";
import { areaContains, areaOverlaps, type Point } from "../graphics/geometry.ts";
import { conductors } from "../library/conductors.ts";
import { type Library } from "../library/library.ts";
import { linear } from "../library/linear.ts";
import { nonlinear } from "../library/nonlinear.ts";
import { sources } from "../library/sources.ts";
import { type Symbol } from "../symbol/symbol.ts";
import { type TransformOp } from "../symbol/transform.ts";
import { blurActiveInput } from "../widget/form.ts";
import { type HotkeyHandler, hotkeys, Modifiers } from "../widget/hotkeys.ts";
import { type Focusable } from "../widget/props.ts";
import { clipboard } from "./clipboard.ts";
import { type EditAction } from "./edit.ts";
import { type Element } from "./element.ts";
import { filter, findElement } from "./filter.ts";
import { History } from "./history.ts";
import { Instance } from "./instance.ts";
import { type MouseAction } from "./mouse.ts";
import { ElementListMover } from "./move.ts";
import { Note } from "./note.ts";
import { Painter } from "./painter.ts";
import { Schematic } from "./schematic.ts";
import { Selection } from "./selection.ts";
import { exportElements, importElements } from "./serial.ts";
import { type Settings } from "./settings.ts";
import { alignElements, getArea, transformElements } from "./transform.ts";
import { connect, wireShape } from "./wire.ts";
import { Zoom } from "./zoom.ts";

export class Controller {
  readonly #focusRef: RefObject<Focusable> = { current: null };
  readonly #library: Library;
  readonly #settings: Signal<Settings>;
  readonly #schematic: Signal<Schematic>;
  readonly #history: Signal<History>;
  readonly #zoom: Signal<Zoom>;
  readonly #selection: Signal<Selection>;
  readonly #mouseAction: Signal<MouseAction>;
  readonly #hotkeys: HotkeyHandler;
  #painter!: Painter;

  constructor(library: Library, schematic: Schematic) {
    this.#library = library;
    this.#settings = signal({ showGrid: true, showCrosshair: true });
    this.#schematic = signal(schematic);
    this.#history = signal(History.create(schematic));
    this.#zoom = signal(new Zoom());
    this.#selection = signal(new Selection());
    this.#mouseAction = signal<MouseAction>({
      type: "idle",
      cursor: { x: 100, y: 100 },
      hovered: null,
    });
    const zoomBy = (dz: number) => {
      return () => {
        this.#zoom.value = this.#zoom.value.zoomBy(dz);
      };
    };
    const moveBy = (dx: number, dy: number) => {
      return () => {
        this.#zoom.value = this.#zoom.value.moveBy(dx, dy);
      };
    };
    const pasteInstance = (symbol: Symbol) => {
      return () => {
        this.pasteInstance(symbol);
      };
    };
    this.#hotkeys = hotkeys(
      [
        "Digit0",
        () => {
          this.zoomTo("0");
        },
      ],
      ["Equal", zoomBy(+1)],
      ["Minus", zoomBy(-1)],
      [
        "Home",
        () => {
          this.zoomTo("1");
        },
      ],
      [
        "Space",
        () => {
          this.zoomTo("all");
        },
      ],
      ["ArrowLeft", moveBy(-10, 0)],
      ["Shift+ArrowLeft", moveBy(-100, 0)],
      ["ArrowRight", moveBy(+10, 0)],
      ["Shift+ArrowRight", moveBy(+100, 0)],
      ["ArrowUp", moveBy(0, -10)],
      ["Shift+ArrowUp", moveBy(0, -100)],
      ["ArrowDown", moveBy(0, +10)],
      ["Shift+ArrowDown", moveBy(0, +100)],
      [
        "Ctrl+a",
        () => {
          this.select("all");
        },
      ],
      [
        "Ctrl+x",
        () => {
          this.selectionCut();
        },
      ],
      [
        "Ctrl+c",
        () => {
          this.selectionCopy();
        },
      ],
      [
        "Ctrl+v",
        () => {
          this.selectionPaste();
        },
      ],
      [
        "Delete",
        () => {
          this.selectionDelete();
        },
      ],
      [
        "Ctrl+z",
        () => {
          this.undo();
        },
      ],
      [
        "Ctrl+y",
        () => {
          this.redo();
        },
      ],
      [
        "Alt+l",
        () => {
          if (this.transformSelection("rl")) {
            return;
          }
          return false;
        },
      ],
      [
        "Alt+r",
        () => {
          if (this.transformSelection("rr")) {
            return;
          }
          return false;
        },
      ],
      [
        "Alt+h",
        () => {
          if (this.transformSelection("mx")) {
            return;
          }
          return false;
        },
      ],
      [
        "Alt+v",
        () => {
          if (this.transformSelection("my")) {
            return;
          }
          return false;
        },
      ],
      [
        "Escape",
        () => {
          if (this.#cancelMouseAction()) {
            return;
          }
          if (this.#selection.value.full) {
            this.#selection.value = this.#selection.value.clear();
            return;
          }
          return false;
        },
      ],
      [
        "w",
        () => {
          this.#cancelMouseAction();
          if (this.#placeWire_start()) {
            return;
          }
          return false;
        },
      ],
      ["g", pasteInstance(conductors.ground)],
      ["o", pasteInstance(conductors.port)],
      ["v", pasteInstance(sources.vdc)],
      ["i", pasteInstance(sources.idc)],
      ["r", pasteInstance(linear.resistor)],
      ["c", pasteInstance(linear.capacitor)],
      ["l", pasteInstance(linear.inductor)],
      ["d", pasteInstance(nonlinear.diode)],
      ["n", pasteInstance(nonlinear.npn)],
      ["p", pasteInstance(nonlinear.pnp)],
      ["Shift+N", pasteInstance(nonlinear.nmos)],
      ["Shift+P", pasteInstance(nonlinear.pmos)],
      ["a", pasteInstance(nonlinear.opamp)],
      [
        "t",
        () => {
          this.pasteNote("");
        },
      ],
    );
  }

  get focusRef(): RefObject<Focusable> {
    return this.#focusRef;
  }

  get library(): Library {
    return this.#library;
  }

  get settings(): Settings {
    return this.#settings.value;
  }

  get schematic(): Schematic {
    return this.#schematic.value;
  }

  get history(): History {
    return this.#history.value;
  }

  get zoom(): Zoom {
    return this.#zoom.value;
  }

  get selection(): Selection {
    return this.#selection.value;
  }

  get mouseAction(): MouseAction {
    return this.#mouseAction.value;
  }

  attach(canvas: HTMLCanvasElement) {
    this.#painter = new Painter(canvas);
    this.#zoom.value = this.#getDefaultZoom(false);
  }

  handleFocus = (ev: FocusEvent) => {
    this.#toIdle();
  };

  handleBlur = (ev: FocusEvent) => {
    this.#cancelMouseAction();
    this.#toIdle();
  };

  handleKeyDown = (ev: KeyboardEvent) => {
    if (!this.#hotkeys(ev)) {
      this.#handleAdjustKey(ev);
    }
  };

  handleKeyUp = (ev: KeyboardEvent) => {
    this.#handleAdjustKey(ev);
  };

  #handleAdjustKey(ev: KeyboardEvent) {
    const { key } = ev;
    const mod = Modifiers.of(ev);
    if (key === "Shift" && this.#drawWire_adjust(key, mod)) {
      ev.preventDefault();
      return;
    }
    if (key === "Alt" && this.#drawWire_adjust(key, mod)) {
      ev.preventDefault();
      return;
    }
    if (key === "Shift" && this.#selectArea_adjust(key, mod)) {
      ev.preventDefault();
      return;
    }
  }

  handleMouseDown = (ev: MouseEvent) => {
    blurActiveInput();
    const button = ev.button;
    const mod = Modifiers.of(ev);
    const cursor = this.#cursorOf(ev);
    if (button === 0 && mod === Modifiers.None) {
      if (this.#drawWire_start(cursor, mod)) {
        return;
      }
      if (this.#selectElement_start(cursor, mod)) {
        return;
      }
      if (this.#selectArea_start(cursor)) {
        return;
      }
    }
    if (button === 0 && mod === Modifiers.Shift) {
      if (this.#drawWire_start(cursor, mod)) {
        return;
      }
      if (this.#selectElement_start(cursor, mod)) {
        return;
      }
      if (this.#selectArea_start(cursor)) {
        return;
      }
    }
    if (button === 0 && mod === Modifiers.Alt) {
      if (this.#drawWire_start(cursor, mod)) {
        return;
      }
    }
    if (button === 1 && mod === Modifiers.None) {
      if (this.#scrollCanvas_start(cursor)) {
        return;
      }
    }
  };

  handleMouseMove = (ev: MouseEvent) => {
    const mod = Modifiers.of(ev);
    const cursor = this.#cursorOf(ev);
    if (this.#placeWire_move(cursor)) {
      return;
    }
    if (this.#drawWire_move(cursor, mod)) {
      return;
    }
    if (this.#selectElement_move(cursor)) {
      return;
    }
    if (this.#pasteElements_move(cursor)) {
      return;
    }
    if (this.#selectArea_move(cursor, mod)) {
      return;
    }
    if (this.#scrollCanvas_move(cursor)) {
      return;
    }
    if (this.#mouseAction.value.type === "idle") {
      if (this.#cursorMoved(cursor)) {
        this.#toIdle(cursor);
      }
    }
  };

  handleMouseUp = (ev: MouseEvent) => {
    const cursor = this.#cursorOf(ev);
    if (this.#drawWire_end(cursor)) {
      return;
    }
    if (this.#selectElement_end(cursor)) {
      return;
    }
    if (this.#pasteElements_end(cursor)) {
      return;
    }
    if (this.#selectArea_end(cursor)) {
      return;
    }
    this.#toIdle(cursor);
    return;
  };

  handleWheel = (ev: WheelEvent) => {
    ev.preventDefault();
    const mod = Modifiers.of(ev);
    if (this.#mouseAction.value.type === "idle" && mod === Modifiers.None) {
      this.#zoom.value = this.#zoom.value.zoomBy(-Math.sign(ev.deltaY));
      return;
    }
  };

  handleContextMenu = (ev: MouseEvent) => {
    ev.preventDefault();
  };

  #cursorOf(ev: MouseEvent): Point {
    return { x: ev.offsetX, y: ev.offsetY };
  }

  #cursorMoved(cursor: Point) {
    const x1 = this.#zoom.value.toGridX(cursor.x);
    const y1 = this.#zoom.value.toGridY(cursor.y);
    const x0 = this.#zoom.value.toGridX(this.#mouseAction.value.cursor.x);
    const y0 = this.#zoom.value.toGridY(this.#mouseAction.value.cursor.y);
    return Zoom.snap(x1) !== Zoom.snap(x0) || Zoom.snap(y1) !== Zoom.snap(y0);
  }

  #toIdle(cursor: Point = this.#mouseAction.value.cursor) {
    const x = Zoom.snap(this.#zoom.value.toGridX(cursor.x));
    const y = Zoom.snap(this.#zoom.value.toGridY(cursor.y));
    const hovered = findElement(this.#schematic.value, x, y, filter.notWire);
    this.#mouseAction.value = {
      type: "idle",
      cursor,
      hovered,
    };
  }

  #selectArea_start(cursor: Point) {
    if (this.#mouseAction.value.type === "idle") {
      this.#selection.value = this.#selection.value.clear();
      this.#mouseAction.value = {
        type: "select",
        cursor: { ...cursor },
        origin: { ...cursor },
      };
      return true;
    }
    return false;
  }

  #selectArea_move(cursor: Point, mod: number) {
    if (this.#mouseAction.value.type === "select") {
      const { origin } = this.#mouseAction.value;
      const area = {
        x0: this.#zoom.value.toGridX(Math.min(origin.x, cursor.x)),
        y0: this.#zoom.value.toGridY(Math.min(origin.y, cursor.y)),
        x1: this.#zoom.value.toGridX(Math.max(origin.x, cursor.x)),
        y1: this.#zoom.value.toGridY(Math.max(origin.y, cursor.y)),
      };
      for (const element of this.#schematic.value) {
        if (
          mod === Modifiers.Shift
            ? areaOverlaps(area, element.area) //
            : areaContains(area, element.area)
        ) {
          this.#selection.value = this.#selection.value.add([element]);
        } else {
          this.#selection.value = this.#selection.value.delete([element]);
        }
      }
      this.#mouseAction.value = {
        type: "select",
        cursor,
        origin,
      };
      return true;
    }
    return false;
  }

  #selectArea_adjust(key: string, mod: number) {
    if (this.#mouseAction.value.type === "select") {
      return this.#selectArea_move(this.#mouseAction.value.cursor, mod);
    }
    return false;
  }

  #selectArea_end(cursor: Point) {
    if (this.#mouseAction.value.type === "select") {
      const { origin } = this.#mouseAction.value;
      if (cursor.x === origin.x && cursor.y === origin.y) {
        // A simple click on a free area.
        this.#selection.value = this.#selection.value.clear();
      }
      this.#toIdle(cursor);
      return true;
    }
    return false;
  }

  #selectArea_cancel() {
    if (this.#mouseAction.value.type === "select") {
      this.#selection.value = new Selection();
      this.#toIdle();
      return true;
    }
    return false;
  }

  #selectElement_start(cursor: Point, mod: number) {
    if (this.#mouseAction.value.type === "idle") {
      const element = findElement(
        this.#schematic.value,
        this.#zoom.value.toGridX(cursor.x),
        this.#zoom.value.toGridY(cursor.y),
      );
      if (element != null) {
        if (!this.#selection.value.has(element)) {
          this.#selection.value =
            mod === Modifiers.Shift
              ? this.#selection.value.add([element])
              : this.#selection.value.select([element]);
        }
        const undo = exportElements(this.#schematic.value);
        const mover = new ElementListMover(this.#selection.value.filter(this.#schematic.value));
        this.#schematic.value = this.#schematic.value.unwire();
        this.#mouseAction.value = {
          type: "move",
          cursor: { ...cursor },
          origin: { ...cursor },
          undo,
          mover,
        };
        return true;
      }
    }
    return false;
  }

  #selectElement_move(cursor: Point) {
    if (this.#mouseAction.value.type === "move") {
      if (this.#cursorMoved(cursor)) {
        const { origin, undo, mover } = this.#mouseAction.value;
        const x0 = Zoom.snap(this.#zoom.value.toGridX(origin.x));
        const y0 = Zoom.snap(this.#zoom.value.toGridY(origin.y));
        const x1 = Zoom.snap(this.#zoom.value.toGridX(cursor.x));
        const y1 = Zoom.snap(this.#zoom.value.toGridY(cursor.y));
        mover.moveBy(x1 - x0, y1 - y0);
        this.#schematic.value = this.#schematic.value.unwire();
        this.#mouseAction.value = {
          type: "move",
          cursor,
          origin,
          undo,
          mover,
        };
      }
      return true;
    }
    return false;
  }

  #selectElement_end(cursor: Point) {
    if (this.#mouseAction.value.type === "move") {
      const { origin, mover } = this.#mouseAction.value;
      const x0 = Zoom.snap(this.#zoom.value.toGridX(origin.x));
      const y0 = Zoom.snap(this.#zoom.value.toGridY(origin.y));
      const x1 = Zoom.snap(this.#zoom.value.toGridX(cursor.x));
      const y1 = Zoom.snap(this.#zoom.value.toGridY(cursor.y));
      mover.moveBy(x1 - x0, y1 - y0);
      this.#schematic.value = this.#schematic.value.rewire();
      if (x0 !== x1 || y0 !== y1) {
        this.#updateHistory("move selection");
      }
      this.#toIdle(cursor);
      return true;
    }
    return false;
  }

  #selectElement_cancel() {
    if (this.#mouseAction.value.type === "move") {
      const { undo } = this.#mouseAction.value;
      this.#schematic.value = Schematic.create(importElements(undo));
      this.#selection.value = new Selection();
      this.#toIdle();
      return true;
    }
    return false;
  }

  #pasteElements_start(elements: Iterable<Element>) {
    if (this.#mouseAction.value.type === "idle") {
      const { cursor } = this.#mouseAction.value;
      alignElements(elements, "cm");
      const undo = exportElements(this.#schematic.value);
      const mover = new ElementListMover(elements);
      const x = Zoom.snap(this.#zoom.value.toGridX(cursor.x));
      const y = Zoom.snap(this.#zoom.value.toGridY(cursor.y));
      mover.moveBy(x, y);
      this.#schematic.value = this.#schematic.value.unwire().append(elements).rename();
      this.#selection.value = new Selection(elements);
      this.#mouseAction.value = {
        type: "paste",
        cursor,
        undo,
        mover,
      };
      return true;
    }
    return false;
  }

  #pasteElements_move(cursor: Point) {
    if (this.#mouseAction.value.type === "paste") {
      if (this.#cursorMoved(cursor)) {
        const { undo, mover } = this.#mouseAction.value;
        const x = Zoom.snap(this.#zoom.value.toGridX(cursor.x));
        const y = Zoom.snap(this.#zoom.value.toGridY(cursor.y));
        mover.moveBy(x, y);
        this.#schematic.value = this.#schematic.value.unwire();
        this.#mouseAction.value = {
          type: "paste",
          cursor,
          undo,
          mover,
        };
      }
      return true;
    }
    return false;
  }

  #pasteElements_end(cursor: Point) {
    if (this.#mouseAction.value.type === "paste") {
      const { mover } = this.#mouseAction.value;
      const x = Zoom.snap(this.#zoom.value.toGridX(cursor.x));
      const y = Zoom.snap(this.#zoom.value.toGridY(cursor.y));
      mover.moveBy(x, y);
      this.#schematic.value = this.#schematic.value.rewire();
      this.#updateHistory("paste");
      this.#toIdle(cursor);
      return true;
    }
    return false;
  }

  #pasteElements_cancel() {
    if (this.#mouseAction.value.type === "paste") {
      const { undo } = this.#mouseAction.value;
      this.#schematic.value = Schematic.create(importElements(undo));
      this.#selection.value = new Selection();
      this.#toIdle();
      return true;
    }
    return false;
  }

  #placeWire_start() {
    if (this.#mouseAction.value.type === "idle") {
      this.#selection.value = this.#selection.value.clear();
      const { cursor } = this.#mouseAction.value;
      this.#mouseAction.value = {
        type: "wire-start",
        cursor,
      };
      return true;
    }
    return false;
  }

  #placeWire_move(cursor: Point) {
    if (this.#mouseAction.value.type === "wire-start") {
      this.#mouseAction.value = {
        type: "wire-start",
        cursor,
      };
      return true;
    }
    return false;
  }

  #placeWire_cancel() {
    if (this.#mouseAction.value.type === "wire-start") {
      this.#toIdle();
      return true;
    }
    return false;
  }

  #drawWire_start(cursor: Point, mod: number) {
    if (this.#mouseAction.value.type === "idle") {
      if (this.#canWireFrom(cursor)) {
        this.#selection.value = this.#selection.value.clear();
        this.#mouseAction.value = {
          type: "wire",
          cursor: { ...cursor },
          origin: { ...cursor },
          wires: [],
          shape: wireShape(mod),
        };
        return true;
      }
    }
    if (this.#mouseAction.value.type === "wire-start") {
      this.#mouseAction.value = {
        type: "wire",
        cursor: { ...cursor },
        origin: { ...cursor },
        wires: [],
        shape: wireShape(mod),
      };
      return true;
    }
    return false;
  }

  #drawWire_move(cursor: Point, mod: number) {
    if (this.#mouseAction.value.type === "wire") {
      const { origin } = this.#mouseAction.value;
      const x0 = Zoom.snap(this.#zoom.value.toGridX(origin.x));
      const y0 = Zoom.snap(this.#zoom.value.toGridY(origin.y));
      const x1 = Zoom.snap(this.#zoom.value.toGridX(cursor.x));
      const y1 = Zoom.snap(this.#zoom.value.toGridY(cursor.y));
      const shape = wireShape(mod);
      const wires = connect(x0, y0, x1, y1, shape);
      this.#mouseAction.value = {
        type: "wire",
        cursor,
        origin,
        wires,
        shape,
      };
      return true;
    }
    return false;
  }

  #drawWire_adjust(key: string, mod: number) {
    if (this.#mouseAction.value.type === "wire") {
      return this.#drawWire_move(this.#mouseAction.value.cursor, mod);
    }
    return false;
  }

  #drawWire_end(cursor: Point) {
    if (this.#mouseAction.value.type === "wire") {
      this.#schematic.value = this.#schematic.value.append(this.#mouseAction.value.wires);
      this.#updateHistory("draw wires");
      this.#toIdle(cursor);
      return true;
    }
    return false;
  }

  #drawWire_cancel() {
    if (this.#mouseAction.value.type === "wire") {
      this.#toIdle();
      return true;
    }
    return false;
  }

  #scrollCanvas_start(cursor: Point) {
    if (this.#mouseAction.value.type === "idle") {
      this.#mouseAction.value = {
        type: "scroll",
        cursor: { ...cursor },
        origin: { ...cursor },
        offset: { x: this.#zoom.value.x, y: this.#zoom.value.y },
      };
      return true;
    }
    return false;
  }

  #scrollCanvas_move(cursor: Point) {
    if (this.#mouseAction.value.type === "scroll") {
      const { origin, offset } = this.#mouseAction.value;
      this.#zoom.value = this.#zoom.value.moveTo(
        offset.x + (cursor.x - origin.x),
        offset.y + (cursor.y - origin.y),
      );
      this.#mouseAction.value = {
        type: "scroll",
        cursor,
        origin,
        offset,
      };
      return true;
    }
    return false;
  }

  #cancelMouseAction() {
    if (this.#placeWire_cancel()) {
      return true;
    }
    if (this.#drawWire_cancel()) {
      return true;
    }
    if (this.#selectElement_cancel()) {
      return true;
    }
    if (this.#pasteElements_cancel()) {
      return true;
    }
    if (this.#selectArea_cancel()) {
      return true;
    }
    return false;
  }

  #canWireFrom(cursor: Point) {
    const { network } = this.#schematic.value;
    const x = this.#zoom.value.toGridX(cursor.x);
    const y = this.#zoom.value.toGridY(cursor.y);
    const sx = Zoom.snap(x);
    const sy = Zoom.snap(y);
    return (
      sx - 5 <= x &&
      x <= sx + 5 &&
      sy - 5 <= y &&
      y <= sy + 5 &&
      (network.getWires(sx, sy) != null || network.getPins(sx, sy) != null)
    );
  }

  #getDefaultZoom(cover: boolean) {
    return Zoom.center(
      this.#painter.width,
      this.#painter.height,
      getArea(this.#schematic.peek(), true),
      cover,
    );
  }

  #updateHistory(action: string) {
    this.#history.value = this.#history.value.push(this.#schematic.value, action);
  }

  edit(action: EditAction) {
    this.#schematic.value = this.#schematic.value.edit(action);
  }

  transformSelection(op: TransformOp) {
    if (this.#selection.value.full) {
      const elements = this.#selection.value.filter(this.#schematic.value);
      transformElements(elements, op);
      this.#schematic.value = this.#schematic.value.rewire();
      switch (op) {
        case "rl":
          this.#updateHistory("rotate counter-clockwise");
          break;
        case "rr":
          this.#updateHistory("rotate clockwise");
          break;
        case "mx":
          this.#updateHistory("flip from left to right");
          break;
        case "my":
          this.#updateHistory("flip from top to bottom");
          break;
      }
      return true;
    }
    return false;
  }

  pasteInstance(symbol: Symbol) {
    this.focus();
    this.#cancelMouseAction();
    if (symbol === conductors.wire) {
      this.#placeWire_start();
    } else {
      this.#pasteElements_start([new Instance(symbol)]);
    }
  }

  pasteNote(text: string) {
    this.focus();
    this.#cancelMouseAction();
    this.#pasteElements_start([new Note(text)]);
  }

  undo() {
    if (this.#history.value.canUndo) {
      this.#cancelMouseAction();
      const [schematic, history] = this.#history.value.undo();
      this.#schematic.value = schematic;
      this.#history.value = history;
      this.#selection.value = new Selection();
    }
  }

  redo() {
    if (this.#history.value.canRedo) {
      this.#cancelMouseAction();
      const [schematic, history] = this.#history.value.redo();
      this.#schematic.value = schematic;
      this.#history.value = history;
      this.#selection.value = new Selection();
    }
  }

  select(what: "all" | "none" | "invert" | Iterable<Element>) {
    this.#cancelMouseAction();
    switch (what) {
      case "all":
        this.#selection.value = new Selection(this.#schematic.value);
        break;
      case "none":
        this.#selection.value = new Selection();
        break;
      case "invert":
        this.#selection.value = new Selection(
          [...this.#schematic.value].filter((element) => !this.#selection.value.has(element)),
        );
        break;
      default:
        this.#selection.value = new Selection(what);
        break;
    }
  }

  selectionCut() {
    this.#cancelMouseAction();
    if (this.#selection.value.size > 0) {
      clipboard.put(this.#selection.value.filter(this.#schematic.value));
      this.#schematic.value = this.#schematic.value.delete(this.#selection.value);
      this.#selection.value = new Selection();
      this.#updateHistory("cut");
    }
  }

  selectionCopy() {
    this.#cancelMouseAction();
    if (this.#selection.value.size > 0) {
      clipboard.put(this.#selection.value.filter(this.#schematic.value));
    }
  }

  selectionPaste() {
    if (clipboard.full) {
      this.#cancelMouseAction();
      this.#pasteElements_start(clipboard.take());
    }
  }

  selectionDelete() {
    this.#cancelMouseAction();
    if (this.#selection.value.size > 0) {
      this.#schematic.value = this.#schematic.value.delete(this.#selection.value);
      this.#selection.value = new Selection();
      this.#updateHistory("delete");
    }
  }

  zoomTo(v: "+" | "-" | "0" | "1" | "all") {
    switch (v) {
      case "+":
        this.#zoom.value = this.#zoom.value.zoomBy(+1);
        break;
      case "-":
        this.#zoom.value = this.#zoom.value.zoomBy(-1);
        break;
      case "0":
        this.#zoom.value = new Zoom().moveTo(20, 20);
        break;
      case "1":
        this.#zoom.value = this.#getDefaultZoom(false);
        break;
      case "all":
        this.#zoom.value = this.#getDefaultZoom(true);
        break;
    }
  }

  updateSettings(settings: Partial<Readonly<Settings>>) {
    this.#settings.value = { ...this.#settings.value, ...settings };
  }

  focus() {
    this.#focusRef.current?.focus();
  }

  blur() {
    this.#focusRef.current?.blur();
  }

  get focused() {
    return this.#focusRef.current?.focused ?? false;
  }

  paint() {
    const settings = this.#settings.peek();
    const zoom = this.#zoom.peek();
    const mouseAction = this.#mouseAction.peek();
    this.#painter.reset();
    if (settings.showGrid) {
      this.#painter.paintGrid(zoom);
    }
    switch (mouseAction.type) {
      case "idle": {
        this.#paintSchematic(false, mouseAction.hovered, false);
        if (this.focused && settings.showCrosshair) {
          this.#painter.paintCrosshair(zoom, mouseAction.cursor, false);
        }
        break;
      }
      case "scroll": {
        this.#paintSchematic(false, null, false);
        break;
      }
      case "select": {
        this.#paintSchematic(false, null, false);
        this.#painter.paintSelection(zoom, mouseAction.origin, mouseAction.cursor);
        break;
      }
      case "wire-start": {
        this.#paintSchematic(true, null, false);
        this.#painter.paintCrosshair(zoom, mouseAction.cursor, true);
        break;
      }
      case "wire": {
        this.#painter.paintCrosshair(zoom, mouseAction.cursor, true);
        this.#paintSchematic(true, null, false);
        for (const wire of mouseAction.wires) {
          this.#painter.paintWire(zoom, wire, true);
        }
        break;
      }
      case "move":
      case "paste": {
        this.#paintSchematic(true, null, true);
        const area = getArea(mouseAction.mover.elements, false);
        const x = zoom.toScreenX(Zoom.snap((area.x0 + area.x1) / 2));
        const y = zoom.toScreenY(Zoom.snap((area.y0 + area.y1) / 2));
        this.#painter.paintCrosshair(zoom, { x, y }, true);
        break;
      }
    }
  }

  #paintSchematic(pins: boolean, hovered: Element | null, areas: boolean) {
    const schematic = this.#schematic.peek();
    const zoom = this.#zoom.peek();
    const selection = this.#selection.peek();
    for (const instance of schematic.instances) {
      this.#painter.paintInstance(zoom, instance, selection.has(instance));
      if (instance.symbol !== conductors.ground) {
        this.#painter.paintLabels(zoom, instance, selection.has(instance));
      }
      if (instance === hovered || areas) {
        this.#painter.paintArea(zoom, instance.area, false);
        this.#painter.paintOrigin(zoom, instance, false);
      }
    }
    for (const note of schematic.notes) {
      if (selection.has(note)) {
        this.#painter.paintArea(zoom, note.area, true);
        this.#painter.paintOrigin(zoom, note, true);
      } else if (note === hovered || areas) {
        this.#painter.paintArea(zoom, note.area, false);
        this.#painter.paintOrigin(zoom, note, false);
      }
    }
    for (const wire of schematic.wires) {
      this.#painter.paintWire(zoom, wire, selection.has(wire));
    }
    for (const instance of schematic.instances) {
      if (pins || instance === hovered) {
        this.#painter.paintPins(zoom, instance, selection.has(instance));
      }
    }
    this.#painter.paintJoins(zoom, schematic.network.joins);
  }
}

export const ControllerContext = createContext<Controller>(null!);

export function useController() {
  return useContext(ControllerContext);
}
