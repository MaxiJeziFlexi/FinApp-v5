import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Target, 
  PieChart, 
  BarChart3,
  Bitcoin,
  Coins,
  Trophy,
  Star
} from 'lucide-react';

interface FloatingElementProps {
  icon: any;
  delay: number;
  duration: number;
  x: string;
  y: string;
  size?: string;
  color?: string;
}

const FloatingElement = ({ icon: Icon, delay, duration, x, y, size = "w-12 h-12", color = "text-blue-500" }: FloatingElementProps) => {
  return (
    <motion.div
      className={`absolute ${size} ${color} opacity-20 z-0`}
      style={{ left: x, top: y }}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Icon className="w-full h-full" />
    </motion.div>
  );
};

export default function FloatingElements() {
  const elements = [
    { icon: Brain, delay: 0, duration: 4, x: "10%", y: "20%", color: "text-purple-500" },
    { icon: TrendingUp, delay: 1, duration: 5, x: "85%", y: "15%", color: "text-green-500" },
    { icon: DollarSign, delay: 2, duration: 3.5, x: "75%", y: "70%", color: "text-emerald-500" },
    { icon: Target, delay: 0.5, duration: 4.5, x: "15%", y: "75%", color: "text-blue-500" },
    { icon: PieChart, delay: 1.5, duration: 4, x: "90%", y: "45%", color: "text-cyan-500" },
    { icon: BarChart3, delay: 3, duration: 3, x: "5%", y: "50%", color: "text-indigo-500" },
    { icon: Bitcoin, delay: 2.5, duration: 5.5, x: "80%", y: "85%", color: "text-orange-500", size: "w-8 h-8" },
    { icon: Coins, delay: 0.8, duration: 4.2, x: "25%", y: "10%", color: "text-yellow-500", size: "w-10 h-10" },
    { icon: Trophy, delay: 1.8, duration: 3.8, x: "60%", y: "25%", color: "text-amber-500", size: "w-8 h-8" },
    { icon: Star, delay: 3.2, duration: 4.8, x: "40%", y: "80%", color: "text-pink-500", size: "w-6 h-6" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element, index) => (
        <FloatingElement key={index} {...element} />
      ))}
    </div>
  );
}

// 3D Card Component
export function Card3D({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        rotateY: 5,
        rotateX: 5,
        scale: 1.02,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
    >
      <div
        style={{
          transform: "translateZ(20px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

// 3D Button Component
export function Button3D({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <motion.button
      className={`relative ${className}`}
      onClick={onClick}
      whileHover={{
        rotateY: -5,
        rotateX: 5,
        scale: 1.05,
      }}
      whileTap={{
        scale: 0.95,
        rotateY: 0,
        rotateX: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
    >
      <div
        style={{
          transform: "translateZ(10px)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
        }}
      >
        {children}
      </div>
    </motion.button>
  );
}

// Animated Number Counter for 3D effect
export function AnimatedNumber3D({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  return (
    <motion.div
      initial={{ rotateX: 90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
    >
      <div
        className="text-4xl font-bold"
        style={{
          transform: "translateZ(15px)",
          textShadow: "0 5px 10px rgba(0,0,0,0.3)"
        }}
      >
        {prefix}{value.toLocaleString()}{suffix}
      </div>
    </motion.div>
  );
}