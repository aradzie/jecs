import { mdiClose } from "@mdi/js";
import { Icon } from "../Icon.tsx";
import { useToast } from "./context.tsx";

export function CloseButton() {
  const toast = useToast();
  return (
    <Icon
      shape={mdiClose}
      onClick={() => {
        toast.close();
      }}
    />
  );
}
