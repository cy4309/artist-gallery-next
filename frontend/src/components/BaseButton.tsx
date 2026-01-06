interface BaseButtonProps {
  label?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const BaseButton = ({
  label,
  className,
  onClick,
  children,
}: BaseButtonProps) => {
  return (
    <button
      // className={`py-2 px-6 cursor-pointer inline-flex justify-center items-center border transition-colors duration-150 ${className}`}
      className={`cursor-pointer transition-transform duration-300 flex justify-center items-center border-cyc ${className}`}
      onClick={onClick}
    >
      {/* {label || children} */}
      {children ?? label}
    </button>
  );
};

export default BaseButton;
