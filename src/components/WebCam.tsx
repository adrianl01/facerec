"use client";
import { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs";
import MyButton from "./ui/Button";
import FacialInfo from "./FacialInfo";
import { Play, Square, FlipHorizontal, FlipVertical } from "lucide-react";

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
  const [isMirrored, setIsMirrored] = useState(true); // 👈 nuevo estado

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

    const displaySize = {
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    };
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

      // 👇 aplicar efecto espejo si está activado
      if (isMirrored) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
      }

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

      if (isMirrored) ctx.restore();

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

    setTimeout(runDetection, 100);
  };

  const toggleMirror = () => setIsMirrored((prev) => !prev); // 👈 función toggle

  return (
    <div className="p-1">
      <div className="relative w-[360px] h-[259px] sm:w-[390px] sm:h-[289px] md:w-128 md:h-96 rounded-md border-8 border-gray-300 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          // 👇 aplica el espejo visualmente también al video
          className={`w-full h-full object-cover ${
            isMirrored ? "scale-x-[-1]" : ""
          }`}
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

      <div className="flex flex-row w-full mt-4 gap-3 flex-wrap">
        <FacialInfo>{expressions}</FacialInfo>
        <div className="flex gap-1.5 w-full justify-between">
          {isStreaming ? (
            <MyButton handler={stopCamera} title="Stop">
              <Square className="w-5 h-5" />
            </MyButton>
          ) : (
            <MyButton handler={startCamera} title="Start">
              <Play className="w-5 h-5" />
            </MyButton>
          )}

          <MyButton handler={toggleMirror} title="Toggle Mirror">
            <FlipHorizontal
              className={`w-5 h-5 transition-transform ${
                isMirrored ? "opacity-100" : "opacity-60"
              }`}
            />
          </MyButton>
        </div>
      </div>
    </div>
  );
}
