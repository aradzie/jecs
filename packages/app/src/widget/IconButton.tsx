import { type VNode } from "preact";
import { type IconProps } from "./Icon.tsx";
import * as styles from "./IconButton.module.css";
import { type FocusProps, type KeyboardProps, type MouseProps } from "./props.ts";

type IconButtonProps = {
  readonly autoFocus?: boolean;
  readonly checked?: boolean;
  readonly class?: string;
  readonly icon: VNode<IconProps>;
  readonly title?: string;
} & FocusProps &
  MouseProps &
  KeyboardProps;

function IconButton({
  autoFocus,
  checked,
  class: cls = styles.root,
  disabled,
  icon,
  tabIndex,
  title,
  ...props
}: IconButtonProps) {
  return (
    <button
      class={cls}
      disabled={disabled}
      tabIndex={tabIndex}
      autoFocus={autoFocus}
      aria-checked={checked}
      title={title}
      {...props}
    >
      {icon}
    </button>
  );
}

export { IconButton, type IconButtonProps };
