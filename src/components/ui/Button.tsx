interface Props {
  children: React.ReactNode;
  className?: string;
  handler?: () => void;
  disable?: boolean;
  title?: string;
}
export default function MyButton({
  children,
  className,
  handler,
  disable,
  title,
}: Props) {
  const combinedClassName = className
    ? `${className} px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 border border-gray-500 transition active:scale-95`
    : "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 border border-gray-500 transition active:scale-95";
  return (
    <button
      title={title}
      className={combinedClassName}
      onClick={handler}
      disabled={disable}
    >
      {children}
    </button>
  );
}
