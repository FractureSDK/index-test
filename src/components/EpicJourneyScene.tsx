import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/**
 * Epic Journey Timeline - Replaces Journey section animations
 * Features:
 * - 3D timeline path that winds through space
 * - Glowing nodes representing career milestones
 * - Particle flow along the timeline
 * - Interactive camera that follows scroll
 */
interface JourneyStep {
  year: string;
  role: string;
  org: string;
  desc: string;
}

export default function EpicJourneyScene({
  steps,
  className = "",
}: {
  steps: JourneyStep[];
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
    camera.position.z = 200;
    camera.position.y = -50;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    // ---- Create glow texture ----
    const makeGlowTexture = (color: string) => {
      const size = 128;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    const accentTexture = makeGlowTexture("rgba(200,255,61,1)");
    const violetTexture = makeGlowTexture("rgba(139,108,255,1)");
    const whiteTexture = makeGlowTexture("rgba(244,241,234,1)");

    // ---- Timeline path (curved line through 3D space) ----
    const pathPoints: THREE.Vector3[] = [];
    const segmentHeight = 50;
    const totalHeight = steps.length * segmentHeight;
    
    for (let i = 0; i <= steps.length; i++) {
      const t = i / steps.length;
      const y = -totalHeight / 2 + t * totalHeight;
      const x = Math.sin(t * Math.PI * 2) * 40;
      const z = Math.cos(t * Math.PI * 1.5) * 30;
      pathPoints.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(pathPoints);
    const tubeGeometry = new THREE.TubeGeometry(curve, 100, 1.5, 16, false);
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x8b6cff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(tube);

    // ---- Glowing path core ----
    const coreGeometry = new THREE.TubeGeometry(curve, 100, 0.5, 8, false);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xc8ff3d,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // ---- Milestone nodes ----
    const nodes: THREE.Group[] = [];
    const nodePositions: THREE.Vector3[] = [];
    
    steps.forEach((step, i) => {
      const t = (i + 1) / (steps.length + 1);
      const pos = curve.getPoint(t);
      nodePositions.push(pos);

      const group = new THREE.Group();
      group.position.copy(pos);

      // Outer glowing sphere
      const outerGeo = new THREE.SphereGeometry(6, 32, 32);
      const outerMat = new THREE.MeshBasicMaterial({
        color: 0xc8ff3d,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      });
      const outerSphere = new THREE.Mesh(outerGeo, outerMat);
      group.add(outerSphere);

      // Inner solid sphere
      const innerGeo = new THREE.SphereGeometry(3, 32, 32);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0xf4f1ea,
      });
      const innerSphere = new THREE.Mesh(innerGeo, innerMat);
      group.add(innerSphere);

      // Orbiting ring
      const ringGeo = new THREE.TorusGeometry(10, 0.3, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x8b6cff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      group.add(ring);
      (group as any).ring = ring;

      // Particle halo
      const haloCount = 20;
      for (let j = 0; j < haloCount; j++) {
        const particleGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xc8ff3d : 0x8b6cff,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
        });
        const particle = new THREE.Mesh(particleGeo, particleMat);
        const angle = (j / haloCount) * Math.PI * 2;
        const radius = 12 + Math.random() * 4;
        particle.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          (Math.random() - 0.5) * 8
        );
        (particle as any).baseAngle = angle;
        (particle as any).radius = radius;
        (particle as any).speed = 0.01 + Math.random() * 0.02;
        group.add(particle);
      }

      scene.add(group);
      nodes.push(group);
    });

    // ---- Flowing particles along the path ----
    const flowParticleCount = 300;
    const flowPositions = new Float32Array(flowParticleCount * 3);
    const flowSizes = new Float32Array(flowParticleCount);
    const flowSpeeds = new Float32Array(flowParticleCount);
    const flowOffsets = new Float32Array(flowParticleCount);

    for (let i = 0; i < flowParticleCount; i++) {
      flowOffsets[i] = Math.random();
      flowSpeeds[i] = 0.001 + Math.random() * 0.003;
      flowSizes[i] = 1 + Math.random() * 2;
      
      const t = flowOffsets[i];
      const pos = curve.getPoint(t);
      flowPositions[i * 3] = pos.x;
      flowPositions[i * 3 + 1] = pos.y;
      flowPositions[i * 3 + 2] = pos.z;
    }

    const flowGeo = new THREE.BufferGeometry();
    flowGeo.setAttribute("position", new THREE.BufferAttribute(flowPositions, 3));
    flowGeo.setAttribute("size", new THREE.BufferAttribute(flowSizes, 1));

    const flowMat = new THREE.PointsMaterial({
      size: 2,
      map: accentTexture,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const flowParticles = new THREE.Points(flowGeo, flowMat);
    scene.add(flowParticles);

    // ---- Background stars ----
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const starPalette = [
      new THREE.Color("#f4f1ea"),
      new THREE.Color("#c8ff3d"),
      new THREE.Color("#8b6cff"),
      new THREE.Color("#9fd9ff"),
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 150 + Math.random() * 300;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const col = starPalette[Math.floor(Math.random() * starPalette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.5,
      map: whiteTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ---- Nebula background ----
    const nebulaGroup = new THREE.Group();
    const nebulaColors = [0x6d4bff, 0xc8ff3d, 0x8b6cff];
    
    for (let i = 0; i < 6; i++) {
      const mat = new THREE.SpriteMaterial({
        map: i % 2 === 0 ? violetTexture : accentTexture,
        color: nebulaColors[i % nebulaColors.length],
        transparent: true,
        opacity: 0.06 + Math.random() * 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      const scale = 80 + Math.random() * 60;
      sprite.scale.set(scale, scale, 1);
      sprite.position.set(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        -100 - Math.random() * 80
      );
      nebulaGroup.add(sprite);
    }
    scene.add(nebulaGroup);

    // ---- Animation ----
    const reduced = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let t = 0;
    let targetScrollY = 0;
    let currentScrollY = 0;

    const onScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      targetScrollY = scrollPercent;
    };

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const frame = () => {
      t += 0.002;
      
      // Smooth scroll interpolation
      currentScrollY += (targetScrollY - currentScrollY) * 0.05;

      // Rotate entire system based on scroll
      const scrollRotation = currentScrollY * Math.PI * 0.5;
      tube.rotation.y = scrollRotation * 0.3;
      core.rotation.y = scrollRotation * 0.3;

      // Animate nodes
      nodes.forEach((node, i) => {
        // Pulse outer sphere
        const outerSphere = node.children[0] as THREE.Mesh;
        const scale = 1 + Math.sin(t * 2 + i) * 0.1;
        outerSphere.scale.set(scale, scale, scale);

        // Rotate ring
        const ring = (node as any).ring as THREE.Mesh;
        ring.rotation.x += 0.01;
        ring.rotation.y += 0.015;

        // Animate halo particles
        for (let j = 2; j < node.children.length; j++) {
          const particle = node.children[j] as THREE.Mesh & { baseAngle: number; radius: number; speed: number };
          particle.baseAngle += particle.speed;
          particle.position.x = Math.cos(particle.baseAngle) * particle.radius;
          particle.position.y = Math.sin(particle.baseAngle) * particle.radius;
        }
      });

      // Flow particles along path
      const posAttr = flowGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < flowParticleCount; i++) {
        flowOffsets[i] += flowSpeeds[i];
        if (flowOffsets[i] > 1) flowOffsets[i] = 0;
        
        const pos = curve.getPoint(flowOffsets[i]);
        posAttr.setXYZ(i, pos.x, pos.y, pos.z);
      }
      posAttr.needsUpdate = true;

      // Rotate stars slowly
      stars.rotation.y = t * 0.05;

      // Nebula drift
      nebulaGroup.rotation.z = t * 0.03;
      nebulaGroup.children.forEach((child, i) => {
        child.position.x += Math.sin(t * 0.3 + i) * 0.03;
        child.position.y += Math.cos(t * 0.25 + i) * 0.02;
      });

      // Camera follows scroll with smooth transition
      const cameraTargetY = -currentScrollY * totalHeight * 0.6;
      camera.position.y += (cameraTargetY - camera.position.y) * 0.03;
      camera.position.x = Math.sin(currentScrollY * Math.PI * 2) * 30;
      camera.lookAt(0, camera.position.y - 20, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll);
    
    if (!reduced) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);

      tubeGeometry.dispose();
      tubeMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      flowGeo.dispose();
      flowMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      accentTexture.dispose();
      violetTexture.dispose();
      whiteTexture.dispose();
      
      nodes.forEach((node) => {
        node.children.forEach((child) => {
          (child as THREE.Mesh).geometry.dispose();
          (child as THREE.Mesh).material.dispose();
        });
        scene.remove(node);
      });
      
      nebulaGroup.children.forEach((child) => {
        (child as THREE.Sprite).material.dispose();
      });
      
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [steps]);

  return <div ref={mountRef} className={`absolute inset-0 ${className}`} />;
}
