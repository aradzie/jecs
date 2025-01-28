import {
  mdiAlignHorizontalCenter,
  mdiAlignHorizontalLeft,
  mdiAlignHorizontalRight,
  mdiAlignVerticalBottom,
  mdiAlignVerticalCenter,
  mdiAlignVerticalTop,
} from "@mdi/js";
import { Icon } from "../widget/Icon.tsx";
import { useController } from "./controller.ts";
import { Formula } from "./formula.ts";
import { Instance } from "./instance.ts";
import * as styles from "./PropertiesPane.module.css";
import { Wire } from "./wire.ts";

export function PropertiesPane() {
  const controller = useController();
  const { schematic, selection } = controller;
  const elements = selection.filter(schematic);
  if (elements.length === 1) {
    const [element] = elements;
    if (element instanceof Instance) {
      return <InstancePropertiesPane instance={element} />;
    }
    if (element instanceof Formula) {
      return <FormulaPropertiesPane formula={element} />;
    }
    if (element instanceof Wire) {
      return <WirePropertiesPane wire={element} />;
    }
  }
  return (
    <div class={styles.root}>
      <div class={styles.empty}>-</div>
    </div>
  );
}

function InstancePropertiesPane({ instance }: { instance: Instance }) {
  const { device } = instance.symbol;
  return (
    <div class={styles.root}>
      <div class={styles.title}>{instance.symbol.name}</div>
      <div>name: {instance.name}</div>
      {device != null && (
        <ul>
          {Object.entries(device.propertiesSchema).map(([name, value]) => (
            <li>
              <div class={styles.prop}>
                <span class={styles.propName}>{name}</span>{" "}
                <span class={styles.propValue}>{value.defaultValue || "-"}</span>
              </div>
              <div class={styles.propTitle}>{value.title}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FormulaPropertiesPane({ formula }: { formula: Formula }) {
  return (
    <div class={styles.root}>
      <div class={styles.title}>Formula</div>
      <div>{formula.text}</div>
      <p>
        <Icon shape={mdiAlignHorizontalLeft} size={"24px"} />
        <Icon shape={mdiAlignHorizontalCenter} size={"24px"} />
        <Icon shape={mdiAlignHorizontalRight} size={"24px"} />
        <Icon shape={mdiAlignVerticalTop} size={"24px"} />
        <Icon shape={mdiAlignVerticalCenter} size={"24px"} />
        <Icon shape={mdiAlignVerticalBottom} size={"24px"} />
      </p>
    </div>
  );
}

function WirePropertiesPane({ wire }: { wire: Wire }) {
  return (
    <div class={styles.root}>
      <div class={styles.title}>Wire</div>
    </div>
  );
}
