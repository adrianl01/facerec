import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function FacialInfo({ children }: Props) {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-200 backdrop-blur-md">
      {children}
    </div>
  );
}