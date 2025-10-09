"use client";
import MyButton from "./ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { setisWebCam } from "../../store/uiSlice";

export default function NavBar() {
  const dispatch = useDispatch<AppDispatch>();
  const selectedOption = useSelector((state: RootState) => state.ui.isWebCam);
  return (
    <nav className="w-full p-4 bg-gray-800 text-white flex justify-center gap-2 items-center">
      <MyButton
        className={selectedOption === true ? "bg-blue-600" : ""}
        handler={() => dispatch(setisWebCam(true))}
      >
        Live WebCam
      </MyButton>
      <MyButton
        className={selectedOption === false ? "bg-blue-600" : ""}
        handler={() => dispatch(setisWebCam(false))}
      >
        Upload Image
      </MyButton>
    </nav>
  );
}
