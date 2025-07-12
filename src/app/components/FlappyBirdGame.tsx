"use client";

import { useEffect, useRef } from "react";
import { initializeKaboom } from "./game/gameSetup";

export default function FlappyBirdGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const cleanup = initializeKaboom(canvasRef.current);

    return cleanup;
  }, []);

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <canvas 
        ref={canvasRef}
        className="w-full h-full object-contain"
      />
    </div>
  );
} 