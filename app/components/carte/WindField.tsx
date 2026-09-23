'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/app/utils/cn';

interface WindFieldProps {
  /** Meteorological direction the wind comes FROM, in degrees (0 = north). */
  fromDeg: number;
  /** Wind speed in km/h, drives streak speed and density. */
  speedKmh: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  age: number;
  life: number;
}

/**
 * Streams the forecast wind across the territory sheet as fine ink streaks,
 * travelling toward where the wind blows. Pauses off-screen and when the tab is
 * hidden; under reduced motion it prints a still field of streaks instead.
 */
export default function WindField({
  fromDeg,
  speedKmh,
  className,
}: WindFieldProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const heading = (((fromDeg + 180) % 360) * Math.PI) / 180;
    const vx = Math.sin(heading);
    const vy = -Math.cos(heading);
    const strength = Math.max(0, Math.min(speedKmh, 60)) / 60;
    const pace = 0.45 + strength * 1.9;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let running = false;
    let visible = true;
    let color = '';

    const readColor = (): void => {
      color =
        getComputedStyle(canvas).getPropertyValue('--map-wind').trim() ||
        'rgba(31, 111, 191, 0.55)';
    };

    const spawn = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      age: Math.floor(Math.random() * 80),
      life: 70 + Math.random() * 90,
    });

    const flow = (x: number, y: number, t: number): [number, number] => {
      const bend = (Math.sin(x * 0.0045 + t * 0.00035) + Math.cos(y * 0.0052 - t * 0.00025)) * 0.3;
      const c = Math.cos(bend);
      const s = Math.sin(bend);
      return [vx * c - vy * s, vx * s + vy * c];
    };

    const resize = (): void => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const density = 0.6 + strength * 0.8;
      const count = Math.min(900, Math.round(((width * height) / 2600) * density));
      particles = Array.from({ length: count }, spawn);
      readColor();
      if (reduced) drawStill();
    };

    const drawStill = (): void => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const step = 46;
      for (let y = step / 2; y < height; y += step) {
        for (let x = step / 2; x < width; x += step) {
          const [dx, dy] = flow(x, y, 0);
          ctx.moveTo(x - dx * 9, y - dy * 9);
          ctx.lineTo(x + dx * 9, y + dy * 9);
        }
      }
      ctx.stroke();
    };

    const frame = (t: number): void => {
      if (!running) return;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.085)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      for (const p of particles) {
        const [dx, dy] = flow(p.x, p.y, t);
        const nx = p.x + dx * pace;
        const ny = p.y + dy * pace;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        p.x = nx;
        p.y = ny;
        p.age += 1;
        if (p.age > p.life || nx < -12 || ny < -12 || nx > width + 12 || ny > height + 12) {
          const fresh = spawn();
          p.x = fresh.x;
          p.y = fresh.y;
          p.life = fresh.life;
          p.age = 0;
        }
      }
      ctx.stroke();
      raf = window.requestAnimationFrame(frame);
    };

    const start = (): void => {
      if (reduced || running || !visible || document.hidden) return;
      running = true;
      raf = window.requestAnimationFrame(frame);
    };

    const stop = (): void => {
      running = false;
      window.cancelAnimationFrame(raf);
    };

    resize();
    start();

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    const onVisibility = (): void => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    const themeObserver = new MutationObserver(() => {
      readColor();
      ctx.clearRect(0, 0, width, height);
      if (reduced) drawStill();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      stop();
      resizeObserver.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fromDeg, speedKmh]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none absolute inset-0 size-full', className)}
      aria-hidden="true"
    />
  );
}
