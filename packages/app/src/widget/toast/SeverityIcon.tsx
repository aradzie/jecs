import { mdiAlertCircleOutline, mdiCheckCircleOutline, mdiInformationOutline } from "@mdi/js";
import { Icon } from "../Icon.tsx";

export function SeverityIcon({ severity }: { severity: "info" | "success" | "error" | null }) {
  switch (severity) {
    case "info":
      return <InfoIcon />;
    case "success":
      return <SuccessIcon />;
    case "error":
      return <ErrorIcon />;
    default:
      return null;
  }
}

export function InfoIcon() {
  return <Icon shape={mdiInformationOutline} />;
}

export function SuccessIcon() {
  return <Icon shape={mdiCheckCircleOutline} />;
}

export function ErrorIcon() {
  return <Icon shape={mdiAlertCircleOutline} />;
}
