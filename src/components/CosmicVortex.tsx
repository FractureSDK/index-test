import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

interface CosmicVortexProps {
  particleCount?: number;
  radius?: number;
  speed?: number;
  color?: string;
}

export default function CosmicVortex({ 
  particleCount = 1500, 
  radius = 50, 
  speed = 0.3,
  color = "#c8ff3d"
}: CosmicVortexProps) {
  const meshRef = useRef<THREE.Points>(null);
  const { clock } = useThree();
  
  const mainColor = useMemo(() => new THREE.Color(color), [color]);

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Spiral galaxy distribution
      const angle = (i / particleCount) * Math.PI * 20; // Multiple rotations
      const spiralArm = Math.floor(i / (particleCount / 4)) % 4; // 4 arms
      const armAngle = (spiralArm / 4) * Math.PI * 2;
      
      const distance = (i / particleCount) * radius;
      const spread = Math.random() * 8 - 4; // Random spread from spiral arm
      
      const totalAngle = angle + armAngle;
      const x = Math.cos(totalAngle) * distance + spread * Math.cos(totalAngle + Math.PI/2);
      const z = Math.sin(totalAngle) * distance + spread * Math.sin(totalAngle + Math.PI/2);
      const y = (Math.random() - 0.5) * (distance * 0.3); // Flatten towards center

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color gradient from center to edge
      const t = distance / radius;
      const r = mainColor.r * (1 - t * 0.5);
      const g = mainColor.g * (1 - t * 0.3);
      const b = mainColor.b * (1 - t * 0.2);
      
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;

      sizes[i] = Math.random() * 3 + 1;
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, colors, sizes, phases };
  }, [particleCount, radius, mainColor]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const elapsed = clock.getElapsedTime();
    
    // Rotate the entire vortex
    meshRef.current.rotation.y = elapsed * speed * 0.5;
    meshRef.current.rotation.z = Math.sin(elapsed * 0.05) * 0.1;
    
    // Subtle wave motion on particles
    const time = elapsed * speed;
    meshRef.current.position.y = Math.sin(time) * 2;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particles.sizes.length}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          attribute float size;
          varying vec3 vColor;
          uniform float time;
          
          void main() {
            vColor = color;
            vec3 pos = position;
            
            // Subtle pulsing motion
            float pulse = sin(time * 2.0 + position.x * 0.1) * 0.5;
            pos.y += pulse;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (200.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          void main() {
            float r = distance(gl_PointCoord, vec2(0.5));
            if (r > 0.5) discard;
            
            // Soft glow effect
            float glow = 1.0 - (r * 2.0);
            glow = pow(glow, 1.2);
            
            // Add ring effect
            float ring = sin(r * 10.0) * 0.3 + 0.7;
            glow *= ring;
            
            gl_FragColor = vec4(vColor, glow * 0.9);
          }
        `}
        uniforms={{
          time: { value: 0 }
        }}
        onBeforeCompile={(shader) => {
          shader.uniforms.time = { value: 0 };
        }}
      />
    </points>
  );
}
