import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  life: number;
}

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
  className?: string;
  isActive?: boolean;
}

export default function FloatingParticles({
  count = 20,
  colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'],
  className,
  isActive = true
}: FloatingParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    const createParticle = (id: number): Particle => ({
      id,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
      },
      life: 1
    });

    // Initialize particles
    const initialParticles = Array.from({ length: count }, (_, i) => 
      createParticle(i)
    );
    setParticles(initialParticles);

    // Animation loop
    const animationFrame = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: particle.x + particle.velocity.x,
          y: particle.y + particle.velocity.y,
          life: particle.life - 0.01,
          // Bounce off edges
          velocity: {
            x: particle.x <= 0 || particle.x >= window.innerWidth 
              ? -particle.velocity.x 
              : particle.velocity.x,
            y: particle.y <= 0 || particle.y >= window.innerHeight 
              ? -particle.velocity.y 
              : particle.velocity.y
          }
        }))
        .filter(particle => particle.life > 0)
        .concat(
          // Add new particles to replace dead ones
          Array.from({ length: count - prevParticles.filter(p => p.life > 0).length }, 
            (_, i) => createParticle(Date.now() + i)
          )
        )
      );
    }, 50);

    return () => clearInterval(animationFrame);
  }, [count, colors, isActive]);

  if (!isActive) return null;

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-0 overflow-hidden", className)}>
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full blur-sm"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.life * 0.6
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 0.2, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}