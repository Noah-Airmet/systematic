"use client";

import { useEffect, useRef } from "react";

type Particle = {
  ox: number; // Origin X
  oy: number; // Origin Y
  x: number;  // Current X
  y: number;  // Current Y
  vx: number; // Velocity X
  vy: number; // Velocity Y
};

export function CursorTrace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: -1000, y: -1000 });

  // We don't want to re-initialize particles on every render, just keep them in a ref
  const particlesRef = useRef<Particle[]>([]);

  // Grid spacing distance
  const SPACING = 45;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false }); // alpha false for performance if solid background
    if (!ctx) return;

    let frame = 0;

    // Configurable Physics - Tuned for smooth, calming wave
    const INTERACTION_RADIUS = 180;
    const REPULSION_FORCE = 0.25;
    const SPRING = 0.05;
    const FRICTION = 0.85;

    const initParticles = () => {
      const p = [];
      const cols = Math.floor(canvas.width / SPACING) + 2;
      const rows = Math.floor(canvas.height / SPACING) + 2;

      const offsetX = (canvas.width - ((cols - 1) * SPACING)) / 2;
      const offsetY = (canvas.height - ((rows - 1) * SPACING)) / 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = offsetX + i * SPACING;
          const y = offsetY + j * SPACING;
          p.push({
            ox: x, oy: y,
            x: x, y: y,
            vx: 0, vy: 0
          });
        }
      }
      particlesRef.current = p;
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const onMove = (event: MouseEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
    };

    const onLeave = () => {
      pointerRef.current = { x: -1000, y: -1000 };
    };

    const render = () => {
      frame = requestAnimationFrame(render);

      // Draw dark background directly to canvas
      ctx.fillStyle = "#0A0A0C";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const { x: tX, y: tY } = pointerRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        let dx = 0;
        let dy = 0;
        let distance = Infinity;

        // Calculate repulsion if mouse is on screen
        if (tX !== -1000) {
          dx = p.x - tX;
          dy = p.y - tY;
          distance = Math.sqrt(dx * dx + dy * dy);
        }

        // Apply Interaction Force
        let force = 0;
        if (distance < INTERACTION_RADIUS) {
          // Prevent violent singularity spins by clamping the minimum distance used math
          const clampedDistance = Math.max(distance, 30);

          // Inverse scaling so it pushes harder the closer it is
          force = (INTERACTION_RADIUS - clampedDistance) / INTERACTION_RADIUS;

          // Normalize direction vector and apply force
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * REPULSION_FORCE * 6;
          p.vy += Math.sin(angle) * force * REPULSION_FORCE * 6;
        }

        // Apply Spring Force (pulling back to origin)
        p.vx += (p.ox - p.x) * SPRING;
        p.vy += (p.oy - p.y) * SPRING;

        // Apply Friction and Velocity
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;

        // Calculate visual aesthetics based on displacement and force
        const displacement = Math.sqrt(Math.pow(p.x - p.ox, 2) + Math.pow(p.y - p.oy, 2));

        // Base state is a tiny faint dot
        let size = 1.0;
        let opacity = 0.15;

        // When displaced, grow larger and brighter to "pop out"
        if (displacement > 0.5) {
          // Cap visual scaling
          const visualIntensity = Math.min(displacement / 25, 1);
          size = 1.0 + (visualIntensity * 1.5);
          opacity = 0.15 + (visualIntensity * 0.7);
        }

        // FADE OUT EFFECT: Smoothly hide the dot if the cursor is directly on top of it
        // This prevents visual clutter right where the user is looking and stops the "spin" visual
        let cursorMaskOpacity = 1;
        if (distance < 50) {
          cursorMaskOpacity = distance / 50; // Approches 0 as distance approaches 0
        }

        opacity *= cursorMaskOpacity;

        // Draw the point itself
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);

        // Tint the color slightly blue/accent when heavily interacted with
        if (displacement > 10) {
          ctx.fillStyle = `rgba(180, 210, 255, ${opacity})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(180, 210, 255, ${opacity * 0.5})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    render();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Background must be behind the main layout but capture pointer events by sitting below UI
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 bg-[#0A0A0C]" />;
}
