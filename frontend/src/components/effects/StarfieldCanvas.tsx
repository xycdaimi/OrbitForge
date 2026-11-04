"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isNarrowViewport(): boolean {
  return window.matchMedia("(max-width: 767px)").matches;
}

export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    if (prefersReducedMotion() || isNarrowViewport()) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let frameId = 0;
    let running = true;
    const stars: Star[] = [];
    const starCount = 90;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const seed = () => {
      stars.length = 0;
      const { width, height } = canvas.getBoundingClientRect();
      for (let i = 0; i < starCount; i += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random(),
          size: 0.6 + Math.random() * 1.4,
        });
      }
    };

    const draw = () => {
      if (!running) {
        return;
      }
      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);

      for (const star of stars) {
        star.y += 0.08 + star.z * 0.25;
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }
        const alpha = 0.25 + star.z * 0.55;
        context.fillStyle = `rgba(56, 217, 245, ${alpha})`;
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      }

      frameId = window.requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        window.cancelAnimationFrame(frameId);
        return;
      }
      if (!running) {
        running = true;
        frameId = window.requestAnimationFrame(draw);
      }
    };

    resize();
    seed();
    frameId = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
    />
  );
}
