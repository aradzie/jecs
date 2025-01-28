import { JSX } from "preact";

export type Focusable = {
  focus: () => void;
  blur: () => void;
  get focused(): boolean;
};

export type FocusProps<T extends EventTarget = any> = {
  readonly tabIndex?: number;
  readonly disabled?: boolean;
  readonly onFocus?: JSX.FocusEventHandler<T>;
  readonly onBlur?: JSX.FocusEventHandler<T>;
};

export type MouseProps<T extends EventTarget = any> = {
  readonly onClick?: JSX.MouseEventHandler<T>;
  readonly onMouseDown?: JSX.MouseEventHandler<T>;
  readonly onMouseUp?: JSX.MouseEventHandler<T>;
  readonly onMouseOver?: JSX.MouseEventHandler<T>;
  readonly onMouseOut?: JSX.MouseEventHandler<T>;
  readonly onMouseEnter?: JSX.MouseEventHandler<T>;
  readonly onMouseLeave?: JSX.MouseEventHandler<T>;
  readonly onMouseMove?: JSX.MouseEventHandler<T>;
  readonly onContextMenu?: JSX.MouseEventHandler<T>;
};

export type WheelProps<T extends EventTarget = any> = {
  readonly onWheel?: JSX.WheelEventHandler<T>;
};

export type KeyboardProps<T extends EventTarget = any> = {
  readonly onKeyDown?: JSX.KeyboardEventHandler<T>;
  readonly onKeyUp?: JSX.KeyboardEventHandler<T>;
};
