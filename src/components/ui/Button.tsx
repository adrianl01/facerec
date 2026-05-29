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
  return (
    <button
      title={title}
      onClick={handler}
      disabled={disable}
      className={`
        flex items-center gap-2
        px-4 py-2.5
        rounded-xl
        bg-white/5
        hover:bg-white/10
        border border-white/10
        text-slate-100
        transition-all duration-200
        active:scale-95
        hover:scale-[1.02]
        cursor-pointer
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}