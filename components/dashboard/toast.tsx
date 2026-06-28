type ToastProps = {
  message: string;
  variant: "success" | "error";
};

export function Toast({ message, variant }: ToastProps) {
  const styles =
    variant === "success"
      ? "border-emerald-200 bg-emerald-600 text-white"
      : "border-red-200 bg-red-600 text-white";

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${styles}`}
    >
      {message}
    </div>
  );
}
