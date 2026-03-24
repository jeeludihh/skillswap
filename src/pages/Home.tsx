import { useEffect, useRef } from 'react';

// Notice the added ".." to go up one directory level
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import SwapCard from '../components/SwapCard';
import { offersData, requestsData } from '../data';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const spacing = 30; 
    const dotSize = 3; 
    const interactionRadius = 150; // The size of the "sphere"

    let dots: { 
      x: number; 
      y: number; 
      baseX: number; 
      baseY: number; 
      pushFactor: number;   // How far this specific dot is allowed to be pushed
      angleOffset: number;  // A slight twist so they don't move in perfect straight lines
    }[] = [];
    
    let mouse = { x: -1000, y: -1000 };

    const initDots = () => {
      dots = [];
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          dots.push({ 
            x, 
            y, 
            baseX: x, 
            baseY: y,
            // THE SECRET SAUCE: 
            // Every dot gets a random maximum push distance (between 10px and 120px)
            pushFactor: Math.random() * 110 + 10,
            // A tiny random angle twist so they don't form perfect grid lines when pushed
            angleOffset: (Math.random() - 0.5) * 0.8 
          });
        }
      }
    };

    initDots();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initDots();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#000000'; 

      for (let i = 0; i < dots.length; i++) {
        let dot = dots[i];

        // Calculate distance from the dot's HOME to the mouse
        let dx = dot.baseX - mouse.x;
        let dy = dot.baseY - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy) || 1;

        let targetX = dot.baseX;
        let targetY = dot.baseY;

        if (distance < interactionRadius) {
          // Force is strongest (1.0) at the center, and 0 at the edge of the radius
          let force = (interactionRadius - distance) / interactionRadius;
          
          // Square the force for a smooth, 3D curved drop-off
          force = force * force; 

          // Calculate the angle away from the mouse, plus the dot's unique twist
          let angle = Math.atan2(dy, dx) + dot.angleOffset;
          
          // Multiply the force by this dot's UNIQUE random push limit
          let displacement = force * dot.pushFactor;

          // Set the target coordinate
          targetX = dot.baseX + Math.cos(angle) * displacement;
          targetY = dot.baseY + Math.sin(angle) * displacement;
        }

        // Smoothly ease the dot towards its target
        // If the mouse is still, they will settle here instead of jittering
        dot.x += (targetX - dot.x) * 0.15;
        dot.y += (targetY - dot.y) * 0.15;

        ctx.fillRect(dot.x, dot.y, dotSize, dotSize);
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 relative overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none fixed"
      />
      
      <div className="relative z-10">
        <Navbar />
        <Hero />
      </div>
    </div>
  );
}