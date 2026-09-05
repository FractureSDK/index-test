import { useRef, useMemo, lazy, Suspense, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree, Canvas } from "@react-three/fiber";
import { stats as statsData } from "@/content/stats";
import { siteConfig } from "@/config/site";
import { Line } from "./Reveal";

const StarField = lazy(() => import("./StarField"));

interface FloatingCardProps {
  title: string;
  subtitle: string;
  color: string;
  delay: number;
}

function FloatingCard({ title, subtitle, color, delay }: FloatingCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  useFrame(() => {
    if (!meshRef.current || !glowRef.current) return;
    const elapsed = clock.getElapsedTime();
    
    // Floating motion with phase offset
    const floatY = Math.sin(elapsed * 0.8 + delay) * 0.3;
    const floatX = Math.cos(elapsed * 0.5 + delay) * 0.2;
    
    meshRef.current.position.y = floatY;
    meshRef.current.position.x = floatX;
    
    // Subtle rotation
    meshRef.current.rotation.x = Math.sin(elapsed * 0.3 + delay) * 0.05;
    meshRef.current.rotation.z = Math.cos(elapsed * 0.4 + delay) * 0.03;
    
    // Glow pulse
    const scale = 1 + Math.sin(elapsed * 1.5 + delay) * 0.15;
    glowRef.current.scale.set(scale, scale, 1);
  });

  const cardColor = new THREE.Color(color);

  return (
    <group position={[0, 0, 0]}>
      {/* Card background */}
      <mesh ref={meshRef}>
        <roundedBoxGeometry args={[3.5, 2, 0.1, 4, 0.3]} />
        <meshStandardMaterial
          color="#0a0a0f"
          emissive={cardColor}
          emissiveIntensity={0.1}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      
      {/* Glow behind */}
      <mesh ref={glowRef} position={[0, 0, -0.2]}>
        <planeGeometry args={[3.8, 2.3]} />
        <meshBasicMaterial
          color={cardColor}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Border accent */}
      <mesh position={[0, 0, 0.06]}>
        <roundedBoxGeometry args={[3.52, 2.02, 0.05, 4, 0.31]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}

interface OrbitalRingProps {
  radius: number;
  speed: number;
  color: string;
  particleCount: number;
}

function OrbitalRing({ radius, speed, color, particleCount }: OrbitalRingProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { clock } = useThree();

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const spread = (Math.random() - 0.5) * 0.15;
      
      positions[i * 3] = Math.cos(angle) * (radius + spread);
      positions[i * 3 + 1] = Math.sin(angle) * (radius + spread);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    
    return { positions };
  }, [radius, particleCount]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const elapsed = clock.getElapsedTime();
    pointsRef.current.rotation.z = elapsed * speed;
  });

  const ringColor = new THREE.Color(color);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={ringColor}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function AboutScene() {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useFrame((state) => {
    if (!groupRef.current) return;
    const elapsed = state.clock.getElapsedTime();
    
    // Slow overall rotation
    groupRef.current.rotation.y = Math.sin(elapsed * 0.05) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Central decorative element */}
      <OrbitalRing radius={5} speed={0.02} color="#c8ff3d" particleCount={100} />
      <OrbitalRing radius={6.5} speed={-0.015} color="#6366f1" particleCount={150} />
      <OrbitalRing radius={8} speed={0.01} color="#8b5cf6" particleCount={200} />
      
      {/* Floating cards representing stats */}
      {statsData.map((stat, i) => (
        <FloatingCard
          key={stat.l}
          title={`${stat.v}${stat.s}`}
          subtitle={stat.l}
          color={i % 2 === 0 ? "#c8ff3d" : "#6366f1"}
          delay={i * 0.5}
        />
      ))}
    </group>
  );
}

export default function About() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section id="about" className="relative overflow-hidden py-28 md:py-44">
      {/* Three.js Background Scene */}
      <div className="absolute inset-0 opacity-50">
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 12], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <StarField count={1500} radius={80} speed={0.01} />
            <AboutScene />
          </Canvas>
        </Suspense>
      </div>
      
      {/* Large background text */}
      <span
        className={`pointer-events-none absolute -right-8 top-10 select-none font-display text-[26vw] font-bold leading-none text-bone/[0.03] transition-opacity duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        ABOUT
      </span>

      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className={`mb-14 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.3em] text-bone/40 transition-opacity duration-1000 delay-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}>
          <span className="text-accent">01</span>
          <span>About Me</span>
          <Line className="flex-1" />
        </div>

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <h2
              className={`font-display text-3xl font-medium leading-[1.15] tracking-tight md:text-5xl lg:text-6xl transition-all duration-1000 delay-300 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              我相信最好的界面，是那些让人忘记自己正在使用界面的作品。
            </h2>
            
            <div className={`mt-10 grid gap-8 md:grid-cols-2 transition-all duration-1000 delay-500 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}>
              <p className="text-base leading-relaxed text-bone/65 md:text-lg">
                我是 <span className="text-bone">{siteConfig.name}</span>，一名专注于沉浸式 Web 体验的创意开发者。
                过去六年，我游走于品牌、产品与技术之间，用 WebGL、动效与精密的交互逻辑，把抽象的概念雕琢成可触摸的数字物件。
              </p>
              <p className="text-base leading-relaxed text-bone/65 md:text-lg">
                我痴迷于细节——60fps 的流畅、贝塞尔曲线的微妙、留白的呼吸感。
                我相信技术是手段，情感才是目的。每一个项目都是一次讲故事的机会。
              </p>
            </div>

            {/* Stats Grid with CSS animations instead of Framer Motion */}
            <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-bone/10 bg-bone/10 md:grid-cols-4">
              {statsData.map((s, i) => (
                <StatCounter
                  key={s.l}
                  stat={s}
                  index={i}
                  isVisible={isVisible}
                />
              ))}
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className={`relative mx-auto max-w-sm lg:max-w-none transition-all duration-1000 delay-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-bone/10">
                <img
                  src="/images/portrait.jpg"
                  alt={siteConfig.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div>
                    <p className="font-display text-xl font-semibold">{siteConfig.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone/60">Creative Developer</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-bone/30 glass">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                  </div>
                </div>
              </div>
              
              {/* Rotating SVG ring with CSS animation */}
              <div className="absolute -left-8 -top-8 hidden h-28 w-28 md:block">
                <svg viewBox="0 0 100 100" className="h-full w-full animate-spin-slow">
                  <defs>
                    <path id="circ" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                  </defs>
                  <text className="fill-bone/60 font-mono text-[9px] uppercase tracking-[0.35em]">
                    <textPath href="#circ">Design · Code · Motion · Craft · </textPath>
                  </text>
                </svg>
              </div>
              
              <div className="absolute -bottom-6 -right-4 rounded-2xl px-5 py-4 glass md:-right-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">Currently</p>
                <p className="mt-1 text-sm font-medium">Exploring generative art & R3F</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface StatCounterProps {
  stat: { v: number; s: string; l: string };
  index: number;
  isVisible: boolean;
}

function StatCounter({ stat, index, isVisible }: StatCounterProps) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!isVisible) return;
    
    let start = 0;
    const end = stat.v;
    const duration = 2000;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutExpo)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      start = Math.floor(eased * end);
      setCount(start);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, stat.v]);

  return (
    <div 
      className="bg-ink p-6 md:p-8 transition-all duration-700"
      style={{
        transitionDelay: `${100 + index * 100}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
      }}
    >
      <div className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
        {count}{stat.s}
      </div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">{stat.l}</div>
    </div>
  );
}
