interface BaseButtonNormalProps {
  label?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const BaseButtonNormal = ({
  label,
  className,
  onClick,
  children,
}: BaseButtonNormalProps) => {
  return (
    <button
      // className={`py-2 px-6 cursor-pointer inline-flex justify-center items-center border transition-colors duration-150 ${className}`}
      className={`
        flex items-center justify-center gap-3
        w-full py-3
      bg-white dark:bg-slate-800
      text-slate-700 dark:text-slate-200
        border border-slate-300 dark:border-slate-700
        rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700
        transition-all shadow-sm cursor-pointer
        ${className}
      `}
      onClick={onClick}
    >
      {/* {label || children} */}
      {children ?? label}
    </button>
  );
};

export default BaseButtonNormal;
