"use client";

import MyButton from "./ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { setisWebCam } from "../../store/uiSlice";
import { Camera, Upload } from "lucide-react";

export default function NavBar() {
  const dispatch = useDispatch<AppDispatch>();

  const selectedOption = useSelector(
    (state: RootState) => state.ui.isWebCam
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            FaceDetect AI
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <MyButton
            className={selectedOption ? "bg-sky-500" : ""}
            handler={() => dispatch(setisWebCam(true))}
          >
            <Camera className="w-4 h-4" />
            Live Camera
          </MyButton>

          <MyButton
            className={!selectedOption ? "bg-sky-500" : ""}
            handler={() => dispatch(setisWebCam(false))}
          >
            <Upload className="w-4 h-4" />
            Upload
          </MyButton>
        </div>
      </div>
    </nav>
  );
}