"use client";
import { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs";
import MyButton from "./ui/Button";
import FacialInfo from "./FacialInfo";

export default function WebCam() {
  useEffect(() => {
    (async () => {
      tf.engine().registryFactory;
      if (tf.engine().registryFactory["webgl"]) {
        await tf.setBackend("webgl");
      } else {
        await tf.setBackend("cpu");
      }
      await tf.ready();
      console.log("TF backend:", tf.getBackend());
    })();
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [expressions, setExpressions] = useState<string>("");

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    ]);
    setModelsLoaded(true);
  };

  useEffect(() => {
    loadModels();
  }, []);

  const startCamera = async () => {
    if (!videoRef.current || !modelsLoaded) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsStreaming(true);

      videoRef.current.onloadedmetadata = () => {
        const video = videoRef.current!;
        const canvas = canvasRef.current!;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        detectFaces();
      };
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const stopCamera = () => {
    if (!streamRef.current) return;

    streamRef.current.getTracks().forEach((track) => track.stop());
    videoRef.current!.srcObject = null;
    setIsStreaming(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) stopCamera();
      else if (isStreaming) startCamera();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [isStreaming]);

  const detectFaces = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const displaySize = { width: canvas.width, height: canvas.height };
    faceapi.matchDimensions(canvas, displaySize);

    const runDetection = async () => {
      tf.engine().startScope();
      const detections = await faceapi
        .detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 160,
            scoreThreshold: 0.5,
          })
        )
        .withFaceLandmarks()
        .withFaceExpressions();
      tf.engine().endScope();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      resizedDetections.forEach((d, i) => {
        const { expressions } = d;
        const maxExpression = Object.entries(expressions).reduce(
          (a, b) => (b[1] > a[1] ? b : a),
          ["neutral", 0]
        );
        setExpressions(
          `Face ${++i}: ${maxExpression[0]} (${(maxExpression[1] * 100).toFixed(
            0
          )}%)`
        );
      });
      requestAnimationFrame(runDetection);
    };

    setTimeout(runDetection, 100); // 100 ms = ~10 FPS
  };

  return (
    <div className="p-1">
      <div className="relative w-[360px] h-[259px] sm:w-[390px] sm:h-[289px] md:w-128 md:h-96 rounded-md border-8 border-gray-300 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full z-10"
        />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-semibold">
            Turn on Your Camera 😃
          </div>
        )}
      </div>

      <div className="flex flex-row w-full mt-4 gap-3">
        {isStreaming ? (
          <MyButton className="mt-4" handler={stopCamera}>
            Stop
          </MyButton>
        ) : (
          <MyButton className="mt-4" handler={startCamera}>
            Start
          </MyButton>
        )}
        <FacialInfo children={expressions} />
      </div>
    </div>
  );
}
