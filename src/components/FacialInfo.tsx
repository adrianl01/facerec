import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}
export default function FacialInfo({ children }: Props) {
  return (
    <div className="mt-4 flex font-bold px-4 w-full border-black border-2 rounded-lg items-center">
      {children}
    </div>
  );
}
