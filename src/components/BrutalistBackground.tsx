import { useEffect, useRef } from 'react';

export default function BrutalistBackground() {
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
    const interactionRadius = 150; 

    let dots: { x: number; y: number; baseX: number; baseY: number; pushFactor: number; angleOffset: number; }[] = [];
    let mouse = { x: -1000, y: -1000 };

    const initDots = () => {
      dots = [];
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          dots.push({ 
            x, y, baseX: x, baseY: y,
            pushFactor: Math.random() * 110 + 10,
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
        let dx = dot.baseX - mouse.x;
        let dy = dot.baseY - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy) || 1;

        let targetX = dot.baseX;
        let targetY = dot.baseY;

        if (distance < interactionRadius) {
          let force = (interactionRadius - distance) / interactionRadius;
          force = force * force; 
          let angle = Math.atan2(dy, dx) + dot.angleOffset;
          let displacement = force * dot.pushFactor;

          targetX = dot.baseX + Math.cos(angle) * displacement;
          targetY = dot.baseY + Math.sin(angle) * displacement;
        }

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
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none fixed"
    />
  );
}