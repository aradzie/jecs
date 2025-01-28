import {
  mdiContentCopy,
  mdiContentCut,
  mdiContentPaste,
  mdiDeleteOutline,
  mdiFolderDownloadOutline,
  mdiFolderUploadOutline,
  mdiFullscreen,
  mdiGraphOutline,
  mdiMagnify,
  mdiMagnifyExpand,
  mdiMagnifyMinusOutline,
  mdiMagnifyPlusOutline,
  mdiPlayCircleOutline,
  mdiRedo,
  mdiUndo,
} from "@mdi/js";
import type { Schematic } from "../schematic/schematic.ts";
import * as styles from "./Toolbar.module.css";

export function Toolbar({ schematic }: { schematic: Schematic }) {
  return (
    <div class={styles.root}>
      <Button shape={mdiFolderDownloadOutline} title={"Open"} />
      <Button shape={mdiFolderUploadOutline} title={"Save"} />
      <Separator />
      <Button shape={mdiContentCut} title={"Cut"} />
      <Button shape={mdiContentCopy} title={"Copy"} />
      <Button shape={mdiContentPaste} title={"Paste"} />
      <Button shape={mdiDeleteOutline} title={"Delete"} />
      <Separator />
      <Button shape={mdiUndo} title={"Undo"} />
      <Button shape={mdiRedo} title={"Redo"} />
      <Separator />
      <Button shape={mdiMagnify} title={"Zoom 100%"} />
      <Button shape={mdiMagnifyPlusOutline} title={"Zoom in"} />
      <Button shape={mdiMagnifyMinusOutline} title={"Zoom out"} />
      <Button shape={mdiMagnifyExpand} title={"View all"} />
      <Separator />
      <Button shape={mdiFullscreen} title={"Toggle fullscreen"} />
      <Separator />
      <Button shape={mdiGraphOutline} title={"Show nodes"} />
      <Button shape={mdiPlayCircleOutline} title={"Simulate"} />
    </div>
  );
}

function Button({ shape, title }: { shape: string; title?: string }) {
  return (
    <button class={styles.button} title={title}>
      <svg class={styles.icon} viewBox={"0 0 24 24"}>
        <path d={shape} />
      </svg>
    </button>
  );
}

function Separator() {
  return <span className={styles.separator} />;
}
