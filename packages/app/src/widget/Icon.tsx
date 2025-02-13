import * as styles from "./Icon.module.css";
import { MouseProps } from "./props.ts";

type IconProps = {
  readonly class?: string;
  readonly shape: string;
  readonly size?: string;
  readonly viewBox?: string;
} & MouseProps;

function Icon({
  class: cls = styles.root,
  shape,
  viewBox = "0 0 24 24",
  size = "2rem",
  ...props
}: IconProps) {
  return (
    <svg class={cls} viewBox={viewBox} width={size} height={size} {...props}>
      <path d={shape} />
    </svg>
  );
}

export { type IconProps, Icon };
