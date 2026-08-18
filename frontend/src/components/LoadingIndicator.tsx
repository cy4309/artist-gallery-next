type LoadingIndicatorProps = {
  label?: string;
  className?: string;
};

const LoadingIndicator = ({ label, className }: LoadingIndicatorProps) => {
  return (
    <div
      className={`flex flex-1 min-h-0 w-full items-center justify-center ${className ?? ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="loader" aria-hidden="true" />
        {label ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        ) : null}
      </div>
    </div>
  );
};

export default LoadingIndicator;
