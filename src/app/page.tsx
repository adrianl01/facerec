"use client";

import WebCam from "@/components/WebCam";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import ImageDropzone from "@/components/UploadImg";

export default function Home() {
  const selectedOption = useSelector(
    (state: RootState) => state.ui.isWebCam
  );

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-6xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            AI Face Detection
          </h1>

          <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto">
            Analyze facial expressions in real time using AI-powered face
            recognition and emotion detection.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 md:p-10">
          {selectedOption ? <WebCam /> : <ImageDropzone />}
        </div>
      </section>
    </main>
  );
}