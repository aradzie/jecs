import { mdiUnfoldLessHorizontal, mdiUnfoldMoreHorizontal } from "@mdi/js";
import { JSX } from "preact";
import { useState } from "preact/hooks";
import { Icon } from "./Icon.tsx";
import * as styles from "./ToolWindow.module.css";

export function ToolWindow({
  title,
  children,
  style,
}: {
  title: string;
  children: any;
  style?: JSX.CSSProperties;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div class={styles.root} style={style}>
      <div class={styles.header}>
        <span class={styles.headerText}>{title}</span>
        <span
          class={styles.headerButton}
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          <Icon shape={expanded ? mdiUnfoldLessHorizontal : mdiUnfoldMoreHorizontal} />
        </span>
      </div>
      {expanded && (
        <>
          <div class={styles.content}>{children}</div>
          <ResizeHandle />
        </>
      )}
    </div>
  );
}

function ResizeHandle() {
  return (
    <svg class={styles.resize} viewBox={"0 0 24 24"}>
      <path
        d={
          "M22,22H20V20H22V22M22,18H20V16H22V18M18,22H16V20H18V22M18,18H16V16H18V18M14,22H12V20H14V22M22,14H20V12H22V14Z"
        }
      />
    </svg>
  );
}
