import { type Point } from "../graphics/geometry.ts";
import { type Element } from "./element.ts";
import { type ElementListMover } from "./move.ts";
import { type Serial } from "./serial.ts";
import { type Wire, type WireShape } from "./wire.ts";

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

/** Start drawing a wire from an arbitrary point. */
export type MouseWireStartAction = {
  type: "wire-start";
  /** Current cursor position. */
  cursor: Point;
};

/** Draw wires. */
export type MouseWireAction = {
  type: "wire";
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
  | MouseWireStartAction
  | MouseWireAction
  | MouseMoveAction
  | MousePasteAction;
