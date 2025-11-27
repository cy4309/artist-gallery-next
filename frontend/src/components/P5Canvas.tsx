"use client";

import { useEffect, useRef, useState } from "react";
import p5 from "p5";

export default function P5Canvas() {
  const sketchRef = useRef<HTMLDivElement | null>(null);
  const p5Instance = useRef<p5 | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    if (sketchRef.current) resizeObserver.observe(sketchRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!size.width || !size.height) return;

    const particles: { x: number; y: number; clr: p5.Color }[] = [];

    const generateParticles = (p: p5) => {
      particles.length = 0;
      for (let y = 0; y < p.height; y += 10) {
        for (let x = 0; x < p.width; x += 10) {
          particles.push({
            x,
            y,
            clr: p.color(p.noise(x / 50, y / 50) * 360, 40, 40),
          });
        }
      }
    };

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(size.width, size.height);
        p.background(0);
        p.colorMode(p.HSB);
        p.noiseSeed(Math.floor(Math.random() * 10000));
        generateParticles(p);
      };

      p.draw = () => {
        p.noStroke();
        p.background(0, 0.001);

        for (const part of particles) {
          p.fill(part.clr);
          p.ellipse(part.x, part.y, 1);
          part.x += (p.noise(part.x / 200, part.y / 200, 1000) - 0.5) * 2;
          part.y += (p.noise(part.x / 200, part.y / 200, 10000) - 0.5) * 2;
        }
      };

      p.mousePressed = () => {
        p.noiseSeed(Math.floor(Math.random() * 10000));
        generateParticles(p);
        p.background(0);
      };
    };

    p5Instance.current = new p5(sketch, sketchRef.current!);
    return () => p5Instance.current?.remove();
  }, [size]);

  return <div ref={sketchRef} className="w-full h-[400px] mb-4" />;
}
