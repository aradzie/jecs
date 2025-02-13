import * as styles from "./Toolbar.module.css";

type ToolbarProps = {
  readonly children: any;
  readonly class?: string;
};

function Toolbar({
  children, //
  class: cls = styles.root,
}: ToolbarProps) {
  return <div class={cls}>{children}</div>;
}

function Separator() {
  return <span class={styles.separator} />;
}

Toolbar.Separator = Separator;

export { type ToolbarProps, Toolbar };
