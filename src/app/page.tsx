"use client";
import WebCam from "@/components/WebCam";
import { RootState, store } from "../../store";
import { useSelector } from "react-redux";
import ImageDropzone from "@/components/UploadImg";

export default function Home() {
  const state = store.getState().ui;
  const selectedOption = useSelector((state: RootState) => state.ui.isWebCam);
  return (
    <main className="flex flex-col items-center justify-between pt-3">
      {selectedOption ? <WebCam /> : <ImageDropzone />}
    </main>
  );
}
