import { ReactNode } from "react";

type props = {
  children: ReactNode;
};
export default function FacialInfo({ children }: props) {
  return (
    <div className="mt-4 flex font-bold px-4 w-full border-black border-2 rounded-lg items-center">
      {children}
    </div>
  );
}
