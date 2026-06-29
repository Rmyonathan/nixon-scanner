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
      className={`fixed bottom-4 left-4 right-4 z-50 rounded-xl border px-4 py-3 text-center text-sm font-medium shadow-lg sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm sm:text-left ${styles}`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      {message}
    </div>
  );
}
