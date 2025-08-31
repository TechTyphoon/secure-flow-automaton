import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface QuantumParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  charge: number;
  entangled?: boolean;
  color: string;
}

interface QuantumVisualizationProps {
  width?: number;
  height?: number;
  particleCount?: number;
  showEntanglement?: boolean;
}

const QuantumVisualization: React.FC<QuantumVisualizationProps> = ({
  width = 400,
  height = 300,
  particleCount = 20,
  showEntanglement = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<QuantumParticle[]>([]);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [entanglementMode, setEntanglementMode] = React.useState(false);

  // Initialize particles
  useEffect(() => {
    const particles: QuantumParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        charge: Math.random() > 0.5 ? 1 : -1,
        entangled: Math.random() > 0.7,
        color: Math.random() > 0.5 ? '#3b82f6' : '#ef4444'
      });
    }
    particlesRef.current = particles;
  }, [width, height, particleCount]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!isPlaying) return;

      ctx.clearRect(0, 0, width, height);

      // Update particles
      particlesRef.current.forEach((particle, index) => {
        // Quantum tunneling effect
        if (Math.random() < 0.001) {
          particle.x = Math.random() * width;
          particle.y = Math.random() * height;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off walls
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(width, particle.x));
        particle.y = Math.max(0, Math.min(height, particle.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Draw entanglement lines
        if (showEntanglement && particle.entangled) {
          particlesRef.current.forEach((otherParticle, otherIndex) => {
            if (index !== otherIndex && otherParticle.entangled) {
              const distance = Math.sqrt(
                Math.pow(particle.x - otherParticle.x, 2) +
                Math.pow(particle.y - otherParticle.y, 2)
              );

              if (distance < 100) {
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(otherParticle.x, otherParticle.y);
                ctx.strokeStyle = `rgba(59, 130, 246, ${1 - distance / 100})`;
                ctx.lineWidth = 1;
                ctx.stroke();
              }
            }
          });
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, width, height, showEntanglement]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const resetSimulation = () => {
    particlesRef.current.forEach(particle => {
      particle.x = Math.random() * width;
      particle.y = Math.random() * height;
      particle.vx = (Math.random() - 0.5) * 2;
      particle.vy = (Math.random() - 0.5) * 2;
    });
  };

  const toggleEntanglement = () => {
    setEntanglementMode(!entanglementMode);
    particlesRef.current.forEach(particle => {
      particle.entangled = Math.random() > (entanglementMode ? 0.3 : 0.7);
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Quantum Particle Simulation
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Real-time quantum entanglement visualization
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetSimulation}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleEntanglement}
            >
              <Zap className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="border rounded-lg bg-slate-50 dark:bg-slate-900"
          />

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Particles: {particleCount}
            </Badge>
            <Badge variant={isPlaying ? "default" : "secondary"}>
              {isPlaying ? "Running" : "Paused"}
            </Badge>
            <Badge variant={entanglementMode ? "default" : "secondary"}>
              Entanglement: {entanglementMode ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• Blue particles: Positive charge</p>
            <p>• Red particles: Negative charge</p>
            <p>• Lines: Quantum entanglement connections</p>
            <p>• Random tunneling: Quantum uncertainty principle</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantumVisualization;
