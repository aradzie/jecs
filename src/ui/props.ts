import type {
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
} from "react";

export type ClassName = any;

export interface FocusProps<T = Element> {
  readonly tabIndex?: number;
  readonly onBlur?: FocusEventHandler<T>;
  readonly onFocus?: FocusEventHandler<T>;
}

export interface MouseProps<T = Element> {
  readonly onClick?: MouseEventHandler<T>;
  readonly onMouseDown?: MouseEventHandler<T>;
  readonly onMouseEnter?: MouseEventHandler<T>;
  readonly onMouseLeave?: MouseEventHandler<T>;
  readonly onMouseUp?: MouseEventHandler<T>;
}

export interface KeyboardProps<T = Element> {
  readonly onKeyDown?: KeyboardEventHandler<T>;
  readonly onKeyUp?: KeyboardEventHandler<T>;
}
