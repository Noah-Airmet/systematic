"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number; vx: number; vy: number };

export function CursorTrace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: -1000, y: -1000 });

  // We'll maintain multiple trailing points that follow each other with spring physics
  // This creates a smooth, slinky-like effect instead of a rigid jagged line
  const NUM_POINTS = 24;
  const pointsRef = useRef<Point[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize points off-screen
    pointsRef.current = Array.from({ length: NUM_POINTS }, () => ({
      x: -1000,
      y: -1000,
      vx: 0,
      vy: 0,
    }));

    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const onMove = (event: MouseEvent) => {
      // If this is the "first" move (points are offscreen), snap them instantly to the cursor
      if (pointerRef.current.x === -1000) {
        pointsRef.current.forEach(p => {
          p.x = event.clientX;
          p.y = event.clientY;
        });
      }
      pointerRef.current = { x: event.clientX, y: event.clientY };
    };

    const render = () => {
      frame = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const points = pointsRef.current;
      const { x: targetX, y: targetY } = pointerRef.current;

      // Don't render until they move the mouse
      if (targetX === -1000) return;

      // Spring physics variables
      const spring = 0.45;
      const friction = 0.65;

      // Update the head point to follow the actual cursor
      const dx = targetX - points[0].x;
      const dy = targetY - points[0].y;

      points[0].vx += dx * spring;
      points[0].vy += dy * spring;
      points[0].vx *= friction;
      points[0].vy *= friction;
      points[0].x += points[0].vx;
      points[0].y += points[0].vy;

      // Update the rest of the body to follow the point ahead of it
      for (let i = 1; i < NUM_POINTS; i++) {
        const p = points[i];
        const leader = points[i - 1];

        // Slower spring for the tail points gives that fluid techy drag
        const pSpring = 0.45;
        const pFriction = 0.45;

        const pdx = leader.x - p.x;
        const pdy = leader.y - p.y;

        p.vx += pdx * pSpring;
        p.vy += pdy * pSpring;
        p.vx *= pFriction;
        p.vy *= pFriction;
        p.x += p.vx;
        p.y += p.vy;
      }

      // Render the trail - drawing multiple overlapping layered lines for a techy glowing effect

      // Core glowing line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < NUM_POINTS - 1; i++) {
        // Use quadratic curves for mathematically smooth corners between the simulated points
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[NUM_POINTS - 1].x, points[NUM_POINTS - 1].y);

      // We'll stroke it a few times with different widths/opacities to create a "bloom" effect
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Thick faint outer glow
      ctx.lineWidth = 12;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.stroke();

      // 2. Medium blurred glow
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.stroke();

      // 3. Sharp inner core line
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.stroke();

      // Finally, draw a glowing orb at the exact cursor position (head of the snake)
      // This gives the feeling of a futuristic pointer
      const orb = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, 40);
      orb.addColorStop(0, "rgba(255, 255, 255, 0.8)");
      orb.addColorStop(0.1, "rgba(255, 255, 255, 0.2)");
      orb.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = orb;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 40, 0, Math.PI * 2);
      ctx.fill();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    render();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" />;
}
