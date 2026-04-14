"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function ParallaxBackground() {
  const { scrollYProgress } = useScroll();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth mouse movement
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Layer 1: The Deep Grid (Lattice) - Heavy scroll parallax
  const latticeY = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]); // Increased range
  const latticeRotate = useTransform(springX, [-0.5, 0.5], [-8, 8]); // More dynamic rotation

  // Layer 2: The Nebula (Floating Glows) - Mouse reactive
  const nebulaX = useTransform(springX, [-0.5, 0.5], ["-80px", "80px"]);
  const nebulaY = useTransform(springY, [-0.5, 0.5], ["-80px", "80px"]);

  // Layer 3: Digital Data Shards - Fast kinetic offsets
  const shardsX = useTransform(springX, [-0.5, 0.5], ["150px", "-150px"]);
  const shardsY = useTransform(scrollYProgress, [0, 1], ["0px", "-800px"]); // Much faster scroll

  // Layer 4: Foreground Dust (Fast)
  const dustY = useTransform(scrollYProgress, [0, 1], ["0px", "-1500px"]);

  return (
    <div className="fixed inset-0 z-[0] overflow-hidden pointer-events-none bg-[#050505]">
      {/* Layer 1: Neural Lattice Grid */}
      <motion.div 
        style={{ y: latticeY, rotateX: 25, rotate: latticeRotate }}
        className="absolute inset-[-50%] opacity-40"
      >
        <div 
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(141, 54, 213, 0.3) 1.5px, transparent 1.5px),
              linear-gradient(90deg, rgba(141, 54, 213, 0.3) 1.5px, transparent 1.5px)
            `,
            backgroundSize: "80px 80px",
            perspective: "1000px",
            transform: "rotateX(45deg)"
          }}
        />
      </motion.div>

      {/* Layer 2: Volumetric Nebula Glows */}
      <motion.div 
        style={{ x: nebulaX, y: nebulaY }}
        className="absolute inset-0 flex items-center justify-center opacity-40 blur-[120px]"
      >
        <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-[#8D36D5]/20 via-[#46067A]/10 to-transparent" />
        <div className="absolute top-[20%] left-[30%] h-[400px] w-[400px] rounded-full bg-cyan-500/10" />
      </motion.div>

      {/* Layer 3: Digital Data Shards */}
      <motion.div 
        style={{ x: shardsX, y: shardsY }}
        className="absolute inset-0"
      >
        {[...Array(20)].map((_, i) => ( // Increased count
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.2, 0.5, 0.2], // Increased opacity
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 3 + Math.random() * 5, 
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute rounded-sm border border-white/10 bg-white/10 backdrop-blur-[2px]"
            style={{
              top: `${Math.random() * 300}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </motion.div>

      {/* Layer 4: Foreground Dust Particles (Super Fast) */}
      <motion.div 
        style={{ y: dustY }}
        className="absolute inset-0 pointer-events-none"
      >
        {[...Array(40)].map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute h-1 w-1 rounded-full bg-white/20"
            style={{
              top: `${Math.random() * 400}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: "0 0 10px rgba(255,255,255,0.3)"
            }}
          />
        ))}
      </motion.div>

      {/* Grain Overlay for Cinematic Depth */}
      <div className="absolute inset-0 opacity-[0.03] noise-overlay mix-blend-overlay" />
    </div>
  );
}
