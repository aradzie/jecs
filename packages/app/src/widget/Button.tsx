import { VNode } from "preact";
import * as styles from "./Button.module.css";
import { IconProps } from "./Icon.tsx";
import { FocusProps, KeyboardProps, MouseProps } from "./props.ts";

type ButtonProps = {
  readonly autoFocus?: boolean;
  readonly children?: any;
  readonly class?: string;
  readonly icon?: VNode<IconProps>;
  readonly label?: any;
  readonly title?: string;
} & FocusProps &
  MouseProps &
  KeyboardProps;

function Button({
  autoFocus,
  children,
  class: cls = styles.root,
  disabled,
  icon,
  label,
  tabIndex,
  title,
  ...props
}: ButtonProps) {
  return (
    <button
      class={cls}
      disabled={disabled}
      tabIndex={tabIndex}
      autoFocus={autoFocus}
      title={title}
      {...props}
    >
      {icon}
      {label}
      {children}
    </button>
  );
}

export { type ButtonProps, Button };
