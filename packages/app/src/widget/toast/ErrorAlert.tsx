import { Alert } from "./Alert.tsx";
import { toast } from "./Toaster.tsx";
import { type ToastOptions } from "./types.ts";

function ErrorAlert({ error }: { error: unknown }) {
  return (
    <Alert severity="error">
      {error instanceof AggregateError ? (
        error.errors.map((child, index) => <p key={index}>{String(child)}</p>)
      ) : (
        <p>{String(error)}</p>
      )}
    </Alert>
  );
}

function report(
  error: unknown,
  {
    autoClose = 3000, //
    pauseOnHover = true,
    closeOnClick = false,
  }: Partial<ToastOptions> = {},
) {
  toast(<ErrorAlert error={error} />, {
    autoClose,
    pauseOnHover,
    closeOnClick,
  });
}

ErrorAlert.report = report;

export { ErrorAlert };
