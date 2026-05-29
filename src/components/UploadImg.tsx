"use client";
import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs";
import { resizeImage } from "../../utils";

export default function ImageDropzone() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);

  const MAX_SIZE_MB = 5;
  const MODEL_URL = "/models"; // carpeta en public/

  useEffect(() => {
    (async () => {
      const backends = tf.engine().registryFactory;
      if (backends["webgl"]) {
        await tf.setBackend("webgl");
      } else {
        await tf.setBackend("cpu");
      }
      await tf.ready();
      console.log("TF backend:", tf.getBackend());
    })();
  }, []);

  // Cargar modelos al montar
  useEffect(() => {
    async function loadModels() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
      } catch (err) {
        console.error("Error loading models:", err);
      }
    }
    loadModels();
  }, []);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      detectFaces(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
      setDetections([]);
    }
  }, [file]);

  async function detectFaces(imageUrl: string) {
    setLoading(true);
    setError(null);
    setDetections([]);

    try {
      const img = await faceapi.fetchImage(imageUrl);
      tf.engine().startScope();
      const detections = await faceapi
        .detectAllFaces(
          img,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 160,
            scoreThreshold: 0.5,
          })
        )
        .withFaceLandmarks()
        .withFaceExpressions();
      tf.engine().endScope();
      setDetections(detections);
    } catch (err) {
      console.error(err);
      setError("Unable to analyze image.");
    } finally {
      setLoading(false);
    }
  }

  function handleFiles(selected: FileList | null) {
    if (!selected || selected.length === 0) return;

    const chosen = selected[0];
    resizeImage(chosen);
    if (!chosen.type.startsWith("image/")) {
      setError("Image files only.");
      setFile(null);
      return;
    }

    if (chosen.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`The maximum allowed file size is ${MAX_SIZE_MB}MB.`);
      setFile(null);
      return;
    }

    setError(null);
    setFile(chosen);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function openFileDialog() {
    inputRef.current?.click();
  }

  function removeImage() {
    setFile(null);
    setPreview(null);
    if (preview) URL.revokeObjectURL(preview);
  }

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="md:max-h-[80%]">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
          className={`w-full max-w-2xl p-10 border rounded-3xl text-center cursor-pointer transition-all duration-300
${
  isDragOver
    ? "border-sky-400 bg-sky-400/10 scale-[1.01]"
    : "border-white/10 bg-white/5 hover:bg-white/[0.07]"
}
`}
        >
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            className="hidden"
            aria-label="Upload Image"
            title="Select Image"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <p className="font-medium">
            Drag an image here or <span className="text-indigo-500">click</span>{" "}
            to upload it
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {MAX_SIZE_MB} MB Max. (PNG, JPG, etc.)
          </p>
        </div>

        {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
        {preview && (
          <div className="mt-6 flex flex-col rounded-3xl relative w-full max-w-2xl border border-white/10 bg-white/5 p-5 gap-5 backdrop-blur-md">
            <img
              src={preview}
              alt="Preview"
              className="rounded-md object-cover shadow-md max-h-96"
            />
            <button
              onClick={removeImage}
              className="bg-red-500 text-white rounded-lg w-full h-[20px] flex items-center justify-center hover:bg-red-700"
              title="Delete Image"
            >
              Delete Image
            </button>
          </div>
        )}
      </div>

      {loading && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">
          Analyzing face...
        </p>
      )}

      {!loading && detections.length > 0 && (
        <div className="bg-white/5 border border-white/10 text-slate-200 p-6 rounded-3xl w-full max-w-2xl text-sm backdrop-blur-md">
          <p className="font-semibold mb-2">
            {detections.length} face(s) detected:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {detections.map((d, i) => {
              const sorted = Object.entries(
                d.expressions as Record<string, number>
              ).sort((a, b) => b[1] - a[1]);

              const [expr, score] = sorted[0];
              return (
                <li key={i}>
                  Face {i + 1}: <strong>{expr}</strong> (
                  {(score * 100).toFixed(1)}%)
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {!loading && detections.length == 0 && (
        <div className="bg-white/5 border border-white/10 text-slate-200 p-6 rounded-3xl w-full max-w-2xl text-sm backdrop-blur-md">
          <p className="font-semibold text-center items-center">
            {detections.length} faces detected
          </p>
        </div>
      )}
    </div>
  );
}
