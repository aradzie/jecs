import { type JSX, type RefObject } from "preact";
import { useImperativeHandle, useRef, useState } from "preact/hooks";
import { Modifiers } from "./hotkeys.ts";
import { type Focusable, type FocusProps, type Selectable } from "./props.ts";

export type TextFieldType = "text" | "textarea";

export type TextFieldProps = {
  readonly class?: string;
  readonly maxLength?: number;
  readonly name?: string;
  readonly placeholder?: string;
  readonly readOnly?: boolean;
  readonly inputRef?: RefObject<TextFieldRef | null>;
  readonly style?: JSX.CSSProperties;
  readonly title?: string;
  readonly type: TextFieldType;
  readonly value: string;
  readonly onChange: (value: string) => void;
} & FocusProps;

export type TextFieldRef = Focusable & Selectable;

export function TextField({
  inputRef = { current: null },
  type = "text",
  value,
  onFocus,
  onBlur,
  onChange,
  ...props
}: TextFieldProps) {
  const element = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  useImperativeHandle(inputRef, () => ({
    focus() {
      element.current!.focus();
    },
    blur() {
      element.current!.blur();
    },
    get focused() {
      return document.activeElement === element.current;
    },
    select() {
      element.current!.select();
    },
  }));
  const [text, setText] = useState(value);
  if (type === "textarea") {
    return (
      <textarea
        {...props}
        ref={element}
        value={text}
        onInput={(ev) => {
          setText(ev.currentTarget.value);
        }}
        onFocus={(ev) => {
          onFocus?.(ev);
        }}
        onBlur={(ev) => {
          onChange(text);
          onBlur?.(ev);
        }}
        onKeyDown={(ev) => {
          if (ev.key === "Enter" && Modifiers.of(ev) === Modifiers.Control) {
            ev.preventDefault();
            onChange(text);
          }
        }}
      />
    );
  } else {
    return (
      <input
        {...props}
        ref={element}
        type={type}
        value={text}
        onInput={(ev) => {
          setText(ev.currentTarget.value);
        }}
        onFocus={(ev) => {
          onFocus?.(ev);
        }}
        onBlur={(ev) => {
          onChange(text);
          onBlur?.(ev);
        }}
        onKeyDown={(ev) => {
          if (ev.key === "Enter" && Modifiers.of(ev) === Modifiers.None) {
            ev.preventDefault();
            onChange(text);
          }
        }}
      />
    );
  }
}
