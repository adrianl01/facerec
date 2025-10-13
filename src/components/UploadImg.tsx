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
      setError("Solo se permiten archivos de imagen.");
      setFile(null);
      return;
    }

    if (chosen.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo supera los ${MAX_SIZE_MB} MB permitidos.`);
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
    <div className="flex flex-col items-center gap-4 w-full md:flex-row md:justify-center mx-auto pb-3 md:pb-0 px-4">
      <div className="md:max-h-[80%]">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
          className={`w-full p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition
          ${
            isDragOver
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-500 bg-transparent"
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
          <div className="mt-4 flex flex-col rounded-lg relative w-full border-4 border-white items-center justify-center p-4 gap-4">
            <img
              src={preview}
              alt="Vista previa"
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
        <div className="bg-gray-800 text-gray-200 p-4 rounded-lg w-full md:w-3xs text-sm">
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
    </div>
  );
}
