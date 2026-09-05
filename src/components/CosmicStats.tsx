import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

interface CosmicStatsProps {
  stats: Array<{ v: number; s: string; l: string }>;
}

export default function CosmicStats({ stats }: CosmicStatsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { clock, viewport } = useThree();

  // Create floating stat orbs
  const orbData = useMemo(() => {
    const data = stats.map((stat, i) => {
      const angle = (i / stats.length) * Math.PI * 2;
      const radius = Math.min(viewport.width, viewport.height) * 0.3;
      
      return {
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.6,
          (Math.random() - 0.5) * 10
        ],
        value: stat.v,
        suffix: stat.s,
        label: stat.l,
        color: new THREE.Color(i % 2 === 0 ? "#c8ff3d" : "#6366f1"),
        size: 0.8 + Math.random() * 0.4,
        speed: 0.2 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      };
    });
    
    return data;
  }, [stats, viewport]);

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = clock.getElapsedTime();
    
    // Slow rotation of entire group
    groupRef.current.rotation.y = elapsed * 0.05;
    
    // Individual orb motion handled by their own meshes
  });

  return (
    <group ref={groupRef}>
      {orbData.map((orb, i) => (
        <StatOrb key={i} {...orb} index={i} />
      ))}
    </group>
  );
}

interface StatOrbProps {
  position: [number, number, number];
  value: number;
  suffix: string;
  label: string;
  color: THREE.Color;
  size: number;
  speed: number;
  phase: number;
  index: number;
}

function StatOrb({ position, value, suffix, label, color, size, speed, phase, index }: StatOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  useFrame(() => {
    if (!meshRef.current || !glowRef.current) return;
    const elapsed = clock.getElapsedTime();
    
    // Floating motion
    meshRef.current.position.y = position[1] + Math.sin(elapsed * speed + phase) * 2;
    meshRef.current.position.x = position[0] + Math.cos(elapsed * speed * 0.5 + phase) * 1;
    
    // Rotation
    meshRef.current.rotation.x = Math.sin(elapsed * 0.3 + phase) * 0.2;
    meshRef.current.rotation.z = Math.cos(elapsed * 0.2 + phase) * 0.2;
    
    // Glow pulsing
    const scale = 1 + Math.sin(elapsed * 2 + phase) * 0.1;
    glowRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group position={position}>
      {/* Main orb */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Outer glow */}
      <mesh ref={glowRef} position={[0, 0, -0.5]}>
        <sphereGeometry args={[size * 1.5, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Ring around orb */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size * 1.8, 0.05, 16, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
