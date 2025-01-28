import { clsx } from "clsx";
import { conductors } from "../library/conductors.ts";
import { useController } from "./controller.ts";
import * as styles from "./InstancesPane.module.css";

export function InstancesPane() {
  const controller = useController();
  const { schematic, selection } = controller;
  return (
    <ul class={styles.root}>
      {schematic.instances
        .filter(({ symbol }) => symbol !== conductors.ground && symbol !== conductors.port)
        .map((instance) => (
          <li
            key={instance.id}
            class={clsx(styles.item, selection.has(instance) && styles.selected)}
            onClick={() => {
              controller.select([instance]);
              controller.focus();
            }}
          >
            {instance.symbol.id}:{instance.name} (#{instance.id})
          </li>
        ))}
    </ul>
  );
}
