import { createContext } from "preact";
import { useContext } from "preact/hooks";

export type DialogContextValue = {
  readonly close: () => void;
};

export const DialogContext = createContext<DialogContextValue>(null!);

export function useDialogContext(): DialogContextValue {
  return useContext(DialogContext);
}
