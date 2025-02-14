import { TextField } from "../widget/TextField.tsx";
import { useController } from "./controller.ts";
import { Instance } from "./instance.ts";
import * as styles from "./InstancePropertiesPane.module.css";

export function InstancePropertiesPane({ instance }: { instance: Instance }) {
  const controller = useController();
  const { device } = instance.symbol;
  return (
    <div class={styles.root}>
      <div class={styles.title}>{instance.symbol.name}</div>
      <div class={styles.title}>name: {instance.name}</div>
      {device != null && (
        <table class={styles.table}>
          <tbody>
            {Object.entries(device.propsSchema).map(([name, value]) => (
              <tr>
                <td class={styles.propName}>{name}</td>
                <td class={styles.propValue}>
                  <TextField
                    class={styles.input}
                    type={"text"}
                    value={String(value.defaultValue || "0")}
                    onChange={(value) => {
                      controller.edit({ type: "set-instance-prop", instance, name, value });
                    }}
                  />
                </td>
                <td class={styles.propTitle}>{value.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
