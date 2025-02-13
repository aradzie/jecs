import {
  mdiCalculator,
  mdiContentCopy,
  mdiContentCut,
  mdiContentPaste,
  mdiCrosshairs,
  mdiCrosshairsOff,
  mdiDeleteOutline,
  mdiFlipHorizontal,
  mdiFlipVertical,
  mdiFolderDownloadOutline,
  mdiFolderPlusOutline,
  mdiFolderUploadOutline,
  mdiGrid,
  mdiGridOff,
  mdiHelp,
  mdiMagnify,
  mdiMagnifyExpand,
  mdiMagnifyMinusOutline,
  mdiMagnifyPlusOutline,
  mdiRedo,
  mdiRotateLeft,
  mdiRotateRight,
  mdiSelectAll,
  mdiSelectInverse,
  mdiSelectOff,
  mdiUndo,
} from "@mdi/js";
import { useController } from "../schematic/controller.ts";
import { showDialog } from "../widget/dialog/index.ts";
import { Icon } from "../widget/Icon.tsx";
import { IconButton } from "../widget/IconButton.tsx";
import { ErrorAlert } from "../widget/toast/index.ts";
import { Toolbar } from "../widget/Toolbar.tsx";
import { Calculator } from "./Calculator.tsx";
import { HelpPage } from "./HelpPage.tsx";
import * as styles from "./ToolbarPane.module.css";

export function ToolbarPane() {
  const controller = useController();
  const { settings } = controller;
  return (
    <Toolbar class={styles.root}>
      <IconButton
        icon={<Icon shape={mdiFolderDownloadOutline} />}
        title={"Open schematic"}
        onClick={() => {
          ErrorAlert.report("Not implemented");
        }}
      />
      <IconButton
        icon={<Icon shape={mdiFolderUploadOutline} />}
        title={"Save schematic"}
        onClick={() => {
          ErrorAlert.report("Not implemented");
        }}
      />
      <IconButton
        icon={<Icon shape={mdiFolderPlusOutline} />}
        title={"New schematic"}
        onClick={() => {
          ErrorAlert.report("Not implemented");
        }}
      />
      <Toolbar.Separator />
      <IconButton
        icon={<Icon shape={mdiSelectAll} />}
        title={"Select all"}
        onClick={() => {
          controller.select("all");
          controller.focus();
        }}
      />
      <IconButton
        icon={<Icon shape={mdiSelectInverse} />}
        title={"Invert selection"}
        onClick={() => {
          controller.select("invert");
          controller.focus();
        }}
      />
      <IconButton
        icon={<Icon shape={mdiSelectOff} />}
        title={"Clear selection"}
        onClick={() => {
          controller.select("none");
          controller.focus();
        }}
      />
      <Toolbar.Separator />
      <IconButton
        icon={<Icon shape={mdiContentCut} />}
        title={"Cut selected item(s) to clipboard"}
        onClick={() => {
          controller.selectionCut();
          controller.focus();
        }}
      />
      <IconButton
        icon={<Icon shape={mdiContentCopy} />}
        title={"Copy selected item(s) to clipboard"}
        onClick={() => {
          controller.selectionCopy();
          controller.focus();
        }}
      />
      <IconButton
        icon={<Icon shape={mdiContentPaste} />}
        title={"Paste item(s) from clipboard"}
        onClick={() => {
          controller.selectionPaste();
          controller.focus();
        }}
      />
      <IconButton
        icon={<Icon shape={mdiDeleteOutline} />}
        title={"Delete selected item(s)"}
        onClick={() => {
          controller.selectionDelete();
          controller.focus();
        }}
      />
      <Toolbar.Separator />
      <IconButton
        icon={<Icon shape={mdiRotateLeft} />}
        title={"Rotate selected item(s) to the left"}
        disabled={!controller.selection.full}
        onClick={() => {
          controller.transformSelection("rl");
          controller.focus();
        }}
      />
      <IconButton
        icon={<Icon shape={mdiRotateRight} />}
        title={"Rotate selected item(s) to the right"}
        disabled={!controller.selection.full}
        onClick={() => {
          controller.transformSelection("rr");
          controller.focus();
        }}
      />
      <IconButton
        icon={<Icon shape={mdiFlipHorizontal} />}
        title={"Flip selected item(s) from left to right"}
        disabled={!controller.selection.full}
        onClick={() => {
          controller.transformSelection("mx");
          controller.focus();
        }}
      />
      <IconButton
        icon={<Icon shape={mdiFlipVertical} />}
        title={"Flip selected item(s) from top to bottom"}
        disabled={!controller.selection.full}
        onClick={() => {
          controller.transformSelection("my");
          controller.focus();
        }}
      />
      <Toolbar.Separator />
      <IconButton
        icon={<Icon shape={mdiUndo} />}
        title={"Undo"}
        disabled={!controller.history.canUndo}
        onClick={() => {
          controller.undo();
          controller.focus();
        }}
      />
      <IconButton
        icon={<Icon shape={mdiRedo} />}
        title={"Redo"}
        disabled={!controller.history.canRedo}
        onClick={() => {
          controller.redo();
          controller.focus();
        }}
      />
      <Toolbar.Separator />
      <IconButton
        icon={<Icon shape={mdiMagnify} />}
        title={"Zoom 100%"}
        onClick={() => {
          controller.zoomTo("1");
          controller.focus();
        }}
      />
      <IconButton
        icon={<Icon shape={mdiMagnifyPlusOutline} />}
        title={"Zoom in"}
        onClick={() => {
          controller.zoomTo("+");
          controller.focus();
        }}
      />
      <IconButton
        icon={<Icon shape={mdiMagnifyMinusOutline} />}
        title={"Zoom out"}
        onClick={() => {
          controller.zoomTo("-");
          controller.focus();
        }}
      />
      <IconButton
        icon={<Icon shape={mdiMagnifyExpand} />}
        title={"View all"}
        onClick={() => {
          controller.zoomTo("all");
          controller.focus();
        }}
      />
      <Toolbar.Separator />
      <IconButton
        icon={<Icon shape={settings.showGrid ? mdiGridOff : mdiGrid} />}
        title={settings.showGrid ? "Hide grid" : "Show grid"}
        onClick={() => {
          controller.updateSettings({ showGrid: !settings.showGrid });
          controller.focus();
        }}
      />
      <IconButton
        icon={<Icon shape={settings.showCrosshair ? mdiCrosshairsOff : mdiCrosshairs} />}
        title={settings.showCrosshair ? "Hide crosshair" : "Show crosshair"}
        onClick={() => {
          controller.updateSettings({ showCrosshair: !settings.showCrosshair });
          controller.focus();
        }}
      />
      <Toolbar.Separator />
      <IconButton
        icon={<Icon shape={mdiCalculator} />}
        title={"Calculator"}
        onClick={() => {
          showDialog(<Calculator />, {
            modal: true,
            onClose: () => {
              controller.focus();
            },
          });
        }}
      />
      <Toolbar.Separator />
      <IconButton
        icon={<Icon shape={mdiHelp} />}
        title={"Help"}
        onClick={() => {
          showDialog(<HelpPage />, {
            modal: true,
            onClose: () => {
              controller.focus();
            },
          });
        }}
      />
    </Toolbar>
  );
}
