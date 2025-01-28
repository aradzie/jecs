import { Point } from "../graphics/geometry.ts";
import { Element } from "./element.ts";
import { MOD_ALT, MOD_NONE, MOD_SHIFT } from "./events.ts";
import { ElementListMover } from "./move.ts";
import { Serial } from "./serial.ts";
import { Wire } from "./wire.ts";

/** No mouse action. Moving mouse around does nothing. */
export type MouseIdleAction = {
  type: "idle";
  /** Current cursor position. */
  cursor: Point;
  /** A hovered element, if any. */
  hovered: Element | null;
};

/** Move the schematic canvas. */
export type MouseScrollAction = {
  type: "scroll";
  /** Current cursor position. */
  cursor: Point;
  /** Cursor position at the start of action. */
  origin: Point;
  /** Zoom offset at the start of action. */
  offset: Point;
};

/** Select area. */
export type MouseSelectAction = {
  type: "select";
  /** Current cursor position. */
  cursor: Point;
  /** Cursor position at the start of action. */
  origin: Point;
};

export type MousePlaceWireAction = {
  type: "place-wire";
  /** Current cursor position. */
  cursor: Point;
};

/** Draw wires. */
export type MouseConnectAction = {
  type: "connect";
  /** Current cursor position. */
  cursor: Point;
  /** Cursor position at the start of action. */
  origin: Point;
  /** New wires. */
  wires: readonly Wire[];
  /** L-shaped or diagonal wire. */
  shape: WireShape;
};

/** Move elements and wires. */
export type MouseMoveAction = {
  type: "move";
  /** Current cursor position. */
  cursor: Point;
  /** Cursor position at the start of action. */
  origin: Point;
  /** Restore to this schematic if the action is canceled. */
  undo: Serial;
  /**
   * The mover that will update element coordinates
   * in response to user actions.
   */
  mover: ElementListMover;
};

/** Move elements and wires from the clipboard. */
export type MousePasteAction = {
  type: "paste";
  /** Current cursor position. */
  cursor: Point;
  /** Restore to this schematic if the action is canceled. */
  undo: Serial;
  /**
   * The mover that will update element coordinates
   * in response to user actions.
   */
  mover: ElementListMover;
};

export type MouseAction =
  | MouseIdleAction
  | MouseScrollAction
  | MouseSelectAction
  | MousePlaceWireAction
  | MouseConnectAction
  | MouseMoveAction
  | MousePasteAction;

export type WireShape = "l" | "r" | "d";

export function wireShape(mod: number): WireShape {
  if (mod === MOD_NONE) {
    return "l";
  }
  if (mod === MOD_SHIFT) {
    return "r";
  }
  if (mod === MOD_ALT) {
    return "d";
  }
  return "l";
}

export function connect(x0: number, y0: number, x1: number, y1: number, s: WireShape): Wire[] {
  if (x0 === x1 && y0 === y1) {
    // No connection.
    return [];
  }
  if (s === "d") {
    // A diagonal wire.
    return [new Wire(x0, y0, x1, y1)];
  }
  if (y0 === y1) {
    // A horizontal wire.
    return [new Wire(x0, y0, x1, y1)];
  }
  if (x0 === x1) {
    // A vertical wire.
    return [new Wire(x0, y0, x1, y1)];
  }
  if (s === "l") {
    // An L-shaped wire.
    return [new Wire(x0, y0, x1, y0), new Wire(x1, y0, x1, y1)];
  } else {
    // An L-shaped wire.
    return [new Wire(x0, y0, x0, y1), new Wire(x0, y1, x1, y1)];
  }
}
