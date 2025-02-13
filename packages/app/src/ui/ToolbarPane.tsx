import {
  mdiCalculator,
  mdiContentCopy,
  mdiContentCut,
  mdiContentPaste,
  mdiDeleteOutline,
  mdiFlipHorizontal,
  mdiFlipVertical,
  mdiFolderDownloadOutline,
  mdiFolderPlusOutline,
  mdiFolderUploadOutline,
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
import { ErrorAlert } from "../widget/toast/index.ts";
import { Toolbar } from "../widget/Toolbar.tsx";
import { Calculator } from "./Calculator.tsx";
import { HelpPage } from "./HelpPage.tsx";

export function ToolbarPane() {
  const controller = useController();
  return (
    <Toolbar>
      <Toolbar.Button
        shape={mdiFolderDownloadOutline}
        title={"Open schematic"}
        onClick={() => {
          ErrorAlert.report("Not implemented");
        }}
      />
      <Toolbar.Button
        shape={mdiFolderUploadOutline}
        title={"Save schematic"}
        onClick={() => {
          ErrorAlert.report("Not implemented");
        }}
      />
      <Toolbar.Button
        shape={mdiFolderPlusOutline}
        title={"New schematic"}
        onClick={() => {
          ErrorAlert.report("Not implemented");
        }}
      />
      <Toolbar.Separator />
      <Toolbar.Button
        shape={mdiSelectAll}
        title={"Select all"}
        onClick={() => {
          controller.select("all");
          controller.focus();
        }}
      />
      <Toolbar.Button
        shape={mdiSelectInverse}
        title={"Invert selection"}
        onClick={() => {
          controller.select("invert");
          controller.focus();
        }}
      />
      <Toolbar.Button
        shape={mdiSelectOff}
        title={"Clear selection"}
        onClick={() => {
          controller.select("none");
          controller.focus();
        }}
      />
      <Toolbar.Separator />
      <Toolbar.Button
        shape={mdiContentCut}
        title={"Cut selected item(s) to clipboard"}
        onClick={() => {
          controller.selectionCut();
          controller.focus();
        }}
      />
      <Toolbar.Button
        shape={mdiContentCopy}
        title={"Copy selected item(s) to clipboard"}
        onClick={() => {
          controller.selectionCopy();
          controller.focus();
        }}
      />
      <Toolbar.Button
        shape={mdiContentPaste}
        title={"Paste item(s) from clipboard"}
        onClick={() => {
          controller.selectionPaste();
          controller.focus();
        }}
      />
      <Toolbar.Button
        shape={mdiDeleteOutline}
        title={"Delete selected item(s)"}
        onClick={() => {
          controller.selectionDelete();
          controller.focus();
        }}
      />
      <Toolbar.Separator />
      <Toolbar.Button
        shape={mdiRotateLeft}
        title={"Rotate selected item(s) to the left"}
        disabled={!controller.selection.full}
        onClick={() => {
          controller.transformSelection("rl");
          controller.focus();
        }}
      />
      <Toolbar.Button
        shape={mdiRotateRight}
        title={"Rotate selected item(s) to the right"}
        disabled={!controller.selection.full}
        onClick={() => {
          controller.transformSelection("rr");
          controller.focus();
        }}
      />
      <Toolbar.Button
        shape={mdiFlipHorizontal}
        title={"Flip selected item(s) from left to right"}
        disabled={!controller.selection.full}
        onClick={() => {
          controller.transformSelection("mx");
          controller.focus();
        }}
      />
      <Toolbar.Button
        shape={mdiFlipVertical}
        title={"Flip selected item(s) from top to bottom"}
        disabled={!controller.selection.full}
        onClick={() => {
          controller.transformSelection("my");
          controller.focus();
        }}
      />
      <Toolbar.Separator />
      <Toolbar.Button
        shape={mdiUndo}
        title={"Undo"}
        disabled={!controller.history.canUndo}
        onClick={() => {
          controller.undo();
          controller.focus();
        }}
      />
      <Toolbar.Button
        shape={mdiRedo}
        title={"Redo"}
        disabled={!controller.history.canRedo}
        onClick={() => {
          controller.redo();
          controller.focus();
        }}
      />
      <Toolbar.Separator />
      <Toolbar.Button
        shape={mdiMagnify}
        title={"Zoom 100%"}
        onClick={() => {
          controller.zoomTo("1");
          controller.focus();
        }}
      />
      <Toolbar.Button
        shape={mdiMagnifyPlusOutline}
        title={"Zoom in"}
        onClick={() => {
          controller.zoomTo("+");
          controller.focus();
        }}
      />
      <Toolbar.Button
        shape={mdiMagnifyMinusOutline}
        title={"Zoom out"}
        onClick={() => {
          controller.zoomTo("-");
          controller.focus();
        }}
      />
      <Toolbar.Button
        shape={mdiMagnifyExpand}
        title={"View all"}
        onClick={() => {
          controller.zoomTo("all");
          controller.focus();
        }}
      />
      <Toolbar.Separator />
      <Toolbar.Button
        shape={mdiCalculator}
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
      <Toolbar.Button
        shape={mdiHelp}
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
