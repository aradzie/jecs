import * as styles from "./Alert.module.css";
import { CloseButton } from "./CloseButton.tsx";
import { toastProps, useToast } from "./context.tsx";
import { SeverityIcon } from "./SeverityIcon.tsx";

export function Alert({
  children,
  severity = null,
  closeButton = true,
}: {
  children: any;
  severity?: "info" | "success" | "error" | null;
  closeButton?: boolean;
}) {
  const toast = useToast();
  return (
    <div class={styles.alert} {...toastProps(toast)} popover={true}>
      {severity && <SeverityIcon severity={severity} />}
      <div class={styles.message}>{children}</div>
      {closeButton && <CloseButton />}
    </div>
  );
}
