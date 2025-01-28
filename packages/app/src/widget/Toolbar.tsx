import { Icon } from "./Icon.tsx";
import { FocusProps, MouseProps } from "./props.ts";
import * as styles from "./Toolbar.module.css";

export type ToolbarProps = {
  children: any;
};

function Toolbar({ children }: ToolbarProps) {
  return <div class={styles.root}>{children}</div>;
}

export type ButtonProps = {
  shape: string;
  title?: string;
} & FocusProps &
  MouseProps;

function Button({ shape, title, ...props }: ButtonProps) {
  return (
    <button {...props} class={styles.button} title={title}>
      <Icon shape={shape} />
    </button>
  );
}

Toolbar.Button = Button;

function Separator() {
  return <span class={styles.separator} />;
}

Toolbar.Separator = Separator;

export { Toolbar };
