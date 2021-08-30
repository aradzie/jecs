import {
  mdiContentCopy,
  mdiContentCut,
  mdiContentPaste,
  mdiDelete,
  mdiFileDownload,
  mdiFileUpload,
  mdiGauge,
  mdiGrid,
  mdiRotateLeft,
  mdiRotateRight,
} from "@mdi/js";
import type { FunctionComponent } from "react";
import { parts } from "../parts/part";
import { ComponentBar } from "./ComponentBar";
import { ComponentItem } from "./ComponentItem";
import { Icon } from "./Icon";
import { Schematic } from "./Schematic";
import { StatusBar } from "./StatusBar";
import { ToolBar } from "./ToolBar";
import { ToolItem } from "./ToolItem";

export interface AppProps {}

export const App: FunctionComponent<AppProps> = () => {
  const handleDownload = () => {};
  const handleUpload = () => {};
  const handleToggleGrid = () => {};
  const handleCut = () => {};
  const handleCopy = () => {};
  const handlePaste = () => {};
  const handleDelete = () => {};
  const handleRotateLeft = () => {};
  const handleRotateRight = () => {};
  const handleDcAnalysis = () => {};
  const handleAcAnalysis = () => {};
  const handleTransientAnalysis = () => {};
  const handleSelectPart = () => {};

  return (
    <div className="App">
      <ToolBar>
        <ToolItem //
          title="Download schematic."
          onClick={handleDownload}
        >
          <Icon shape={mdiFileDownload} />
        </ToolItem>
        <ToolItem //
          title="Upload schematic."
          onClick={handleUpload}
        >
          <Icon shape={mdiFileUpload} />
        </ToolItem>
        <ToolItem //
          title="Toggle grid."
          onClick={handleToggleGrid}
        >
          <Icon shape={mdiGrid} />
        </ToolItem>
        <ToolItem //
          title="Cut selected items."
          onClick={handleCut}
        >
          <Icon shape={mdiContentCut} />
        </ToolItem>
        <ToolItem //
          title="Copy selected items."
          onClick={handleCopy}
        >
          <Icon shape={mdiContentCopy} />
        </ToolItem>
        <ToolItem //
          title="Paste items."
          onClick={handlePaste}
        >
          <Icon shape={mdiContentPaste} />
        </ToolItem>
        <ToolItem //
          title="Delete selected items."
          onClick={handleDelete}
        >
          <Icon shape={mdiDelete} />
        </ToolItem>
        <ToolItem //
          title="Rotate selected items to the left."
          onClick={handleRotateLeft}
        >
          <Icon shape={mdiRotateLeft} />
        </ToolItem>
        <ToolItem //
          title="Rotate selected items to the right."
          onClick={handleRotateRight}
        >
          <Icon shape={mdiRotateRight} />
        </ToolItem>
        <ToolItem //
          title="Perform DC analysis."
          onClick={handleDcAnalysis}
        >
          <Icon shape={mdiGauge} />
        </ToolItem>
        <ToolItem //
          title="Perform AC analysis."
          onClick={handleAcAnalysis}
        >
          <Icon shape={mdiGauge} />
        </ToolItem>
        <ToolItem //
          title="Perform transient analysis."
          onClick={handleTransientAnalysis}
        >
          <Icon shape={mdiGauge} />
        </ToolItem>
      </ToolBar>
      <ComponentBar>
        {parts.map((part, index) => (
          <ComponentItem key={index} part={part} />
        ))}
      </ComponentBar>
      <Schematic title="Example" />
      <StatusBar>StatusBar</StatusBar>
    </div>
  );
};
