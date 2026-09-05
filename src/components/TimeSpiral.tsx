import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

interface TimeSpiralProps {
  steps: Array<{ year: string; role: string; org: string; desc: string }>;
}

export default function TimeSpiral({ steps }: TimeSpiralProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { clock, viewport } = useThree();

  const spiralData = useMemo(() => {
    return steps.map((step, i) => {
      const t = i / steps.length;
      const angle = t * Math.PI * 6; // 3 full rotations
      const radius = 3 + t * 8;
      const y = -t * 15 + 5;
      
      return {
        position: [
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ] as [number, number, number],
        step,
        index: i,
        color: new THREE.Color(i % 2 === 0 ? "#c8ff3d" : "#6366f1"),
        rotation: angle,
      };
    });
  }, [steps]);

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = clock.getElapsedTime();
    
    // Slow rotation of entire spiral
    groupRef.current.rotation.y = elapsed * 0.03;
    
    // Subtle vertical movement
    groupRef.current.position.y = Math.sin(elapsed * 0.1) * 0.5;
  });

  return (
    <group ref={groupRef}>
      {/* Central timeline line */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 20, 16]} />
        <meshStandardMaterial
          color="#c8ff3d"
          emissive="#c8ff3d"
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Spiral path */}
      <SpiralPath steps={steps} />
      
      {/* Node markers for each step */}
      {spiralData.map((data) => (
        <TimeNode key={data.index} {...data} />
      ))}
      
      {/* Orbiting particles around the spiral */}
      <OrbitingParticles count={200} />
    </group>
  );
}

function SpiralPath({ steps }: { steps: any[] }) {
  const curve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const count = 200;
    
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 6;
      const radius = 3 + t * 8;
      const y = -t * 15 + 5;
      
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        )
      );
    }
    
    return new THREE.CatmullRomCurve3(points);
  }, [steps]);

  return (
    <mesh>
      <tubeGeometry args={[curve, 100, 0.08, 8, false]} />
      <meshStandardMaterial
        color="#6366f1"
        emissive="#6366f1"
        emissiveIntensity={0.2}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

interface TimeNodeProps {
  position: [number, number, number];
  step: { year: string; role: string; org: string; desc: string };
  index: number;
  color: THREE.Color;
  rotation: number;
}

function TimeNode({ position, step, index, color, rotation }: TimeNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  useFrame(() => {
    if (!meshRef.current || !ringRef.current || !glowRef.current) return;
    const elapsed = clock.getElapsedTime();
    
    // Pulsing glow
    const pulse = Math.sin(elapsed * 2 + index * 0.5) * 0.2 + 0.8;
    glowRef.current.scale.set(pulse, pulse, pulse);
    
    // Ring rotation
    ringRef.current.rotation.z = elapsed * 0.2 * (index % 2 === 0 ? 1 : -1);
  });

  return (
    <group position={position}>
      {/* Main node sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Rotating ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.03, 16, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function OrbitingParticles({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { clock } = useThree();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 10;
      const y = (Math.random() - 0.5) * 15;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    
    return { positions };
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const elapsed = clock.getElapsedTime();
    pointsRef.current.rotation.y = elapsed * 0.05;
  });

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
        size={0.1}
        color="#c8ff3d"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
