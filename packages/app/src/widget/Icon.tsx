import { memo } from "preact/compat";
import * as styles from "./Icon.module.css";
import { MouseProps } from "./props.ts";

export type IconProps = {
  readonly shape: string;
  readonly viewBox?: string;
  readonly size?: string;
} & MouseProps;

export const Icon = memo(function Icon({
  shape,
  viewBox = "0 0 24 24",
  size = "2rem",
  ...props
}: IconProps) {
  return (
    <svg class={styles.root} viewBox={viewBox} width={size} height={size} {...props}>
      <path d={shape} />
    </svg>
  );
});
