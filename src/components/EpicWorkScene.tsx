import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/**
 * Epic Work Gallery - Replaces Work section animations
 * Features:
 * - 3D carousel of project cards in space
 * - Floating holographic displays
 * - Particle trails connecting projects
 * - Dynamic lighting and reflections
 */
interface Project {
  n: string;
  title: string;
  desc: string;
  tag: string;
  year: string;
  color: string;
  img: string;
}

export default function EpicWorkScene({
  projects,
  className = "",
}: {
  projects: Project[];
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
    camera.position.z = 180;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    // ---- Create textures ----
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

    // ---- Project card holders (floating frames) ----
    const cardGroup = new THREE.Group();
    const radius = 70;
    const cards: THREE.Group[] = [];
    
    projects.forEach((project, i) => {
      const angle = (i / projects.length) * Math.PI * 2;
      const group = new THREE.Group();
      
      // Position on circle
      group.position.x = Math.cos(angle) * radius;
      group.position.z = Math.sin(angle) * radius;
      group.position.y = Math.sin(i * 0.8) * 15;
      group.rotation.y = -angle;

      // Holographic frame
      const frameGeo = new THREE.PlaneGeometry(35, 25);
      const frameMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(project.color),
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      group.add(frame);

      // Glowing border
      const borderGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(35, 25));
      const borderMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(project.color),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });
      const border = new THREE.LineSegments(borderGeo, borderMat);
      group.add(border);

      // Corner accents
      const cornerSize = 4;
      const cornerPositions = [
        [-16, 11, 0], [16, 11, 0], [-16, -11, 0], [16, -11, 0],
      ];
      cornerPositions.forEach(([cx, cy, cz]) => {
        const cornerGeo = new THREE.SphereGeometry(cornerSize, 8, 8);
        const cornerMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(project.color),
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
        });
        const corner = new THREE.Mesh(cornerGeo, cornerMat);
        corner.position.set(cx as number, cy as number, cz as number);
        group.add(corner);
      });

      // Orbiting particles around each card
      const orbitCount = 8;
      for (let j = 0; j < orbitCount; j++) {
        const particleGeo = new THREE.SphereGeometry(0.8, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xc8ff3d : 0x8b6cff,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
        });
        const particle = new THREE.Mesh(particleGeo, particleMat);
        const pAngle = (j / orbitCount) * Math.PI * 2;
        const pRadius = 20 + (j % 3) * 3;
        particle.position.set(
          Math.cos(pAngle) * pRadius,
          Math.sin(pAngle) * pRadius * 0.6,
          Math.sin(pAngle * 2) * 8
        );
        (particle as any).baseAngle = pAngle;
        (particle as any).radius = pRadius;
        (particle as any).speed = 0.02 + j * 0.005;
        (particle as any).offset = j;
        group.add(particle);
      }

      cardGroup.add(group);
      cards.push(group);
    });

    scene.add(cardGroup);

    // ---- Connection lines between cards ----
    const lineCount = projects * (projects - 1) / 2;
    const linePositions = new Float32Array(lineCount * 6);
    const lineColors = new Float32Array(lineCount * 6);
    
    let lineIdx = 0;
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const posA = cards[i].position;
        const posB = cards[j].position;
        
        linePositions[lineIdx * 6] = posA.x;
        linePositions[lineIdx * 6 + 1] = posA.y;
        linePositions[lineIdx * 6 + 2] = posA.z;
        linePositions[lineIdx * 6 + 3] = posB.x;
        linePositions[lineIdx * 6 + 4] = posB.y;
        linePositions[lineIdx * 6 + 5] = posB.z;

        const col = new THREE.Color().lerpColors(
          new THREE.Color(projects[i].color),
          new THREE.Color(projects[j].color),
          0.5
        );
        lineColors[lineIdx * 6] = col.r * 0.3;
        lineColors[lineIdx * 6 + 1] = col.g * 0.3;
        lineColors[lineIdx * 6 + 2] = col.b * 0.3;
        lineColors[lineIdx * 6 + 3] = col.r * 0.3;
        lineColors[lineIdx * 6 + 4] = col.g * 0.3;
        lineColors[lineIdx * 6 + 5] = col.b * 0.3;
        
        lineIdx++;
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
    
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const connectionLines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(connectionLines);

    // ---- Central glowing core ----
    const coreGeo = new THREE.IcosahedronGeometry(15, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xc8ff3d,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Inner solid core
    const innerCoreGeo = new THREE.SphereGeometry(8, 32, 32);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0x8b6cff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    scene.add(innerCore);

    // ---- Background stars ----
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const starPalette = [
      new THREE.Color("#f4f1ea"),
      new THREE.Color("#c8ff3d"),
      new THREE.Color("#8b6cff"),
      new THREE.Color("#9fd9ff"),
      new THREE.Color("#ff6b9d"),
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 200 + Math.random() * 400;
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
      size: 2,
      map: whiteTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ---- Nebula clouds ----
    const nebulaGroup = new THREE.Group();
    const nebulaColors = [0x6d4bff, 0xc8ff3d, 0x8b6cff, 0x1a5f7a];
    
    for (let i = 0; i < 10; i++) {
      const mat = new THREE.SpriteMaterial({
        map: i % 2 === 0 ? violetTexture : accentTexture,
        color: nebulaColors[i % nebulaColors.length],
        transparent: true,
        opacity: 0.05 + Math.random() * 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      const scale = 80 + Math.random() * 100;
      sprite.scale.set(scale, scale, 1);
      sprite.position.set(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 200,
        -150 - Math.random() * 100
      );
      nebulaGroup.add(sprite);
    }
    scene.add(nebulaGroup);

    // ---- Floating data particles ----
    const dataParticleCount = 200;
    const dataPositions = new Float32Array(dataParticleCount * 3);
    const dataVelocities: THREE.Vector3[] = [];
    
    for (let i = 0; i < dataParticleCount; i++) {
      dataPositions[i * 3] = (Math.random() - 0.5) * 200;
      dataPositions[i * 3 + 1] = (Math.random() - 0.5) * 150;
      dataPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      dataVelocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      ));
    }

    const dataGeo = new THREE.BufferGeometry();
    dataGeo.setAttribute("position", new THREE.BufferAttribute(dataPositions, 3));
    
    const dataMat = new THREE.PointsMaterial({
      size: 1.5,
      map: accentTexture,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const dataParticles = new THREE.Points(dataGeo, dataMat);
    scene.add(dataParticles);

    // ---- Lighting ----
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xc8ff3d, 3, 300);
    pointLight1.position.set(50, 30, 50);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b6cff, 3, 300);
    pointLight2.position.set(-50, -30, 50);
    scene.add(pointLight2);

    // ---- Animation ----
    const reduced = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let t = 0;
    let rotationSpeed = 0.002;
    let targetRotation = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetRotation = x * 0.5;
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
      
      // Smooth rotation interpolation
      rotationSpeed += (targetRotation - rotationSpeed) * 0.02;
      cardGroup.rotation.y += rotationSpeed;
      connectionLines.rotation.y += rotationSpeed;

      // Rotate entire system slowly
      const baseRotation = t * 0.1;
      cardGroup.rotation.y = baseRotation + rotationSpeed * 50;

      // Animate cards
      cards.forEach((card, i) => {
        // Bobbing motion
        card.position.y = Math.sin(i * 0.8 + t * 1.5) * 15;
        
        // Subtle rotation
        card.rotation.y = -(i / cards.length) * Math.PI * 2 + baseRotation;
        card.rotation.x = Math.sin(t * 0.5 + i) * 0.1;

        // Animate orbiting particles
        for (let j = 3; j < card.children.length; j++) {
          const particle = card.children[j] as THREE.Mesh & { 
            baseAngle: number; 
            radius: number; 
            speed: number;
            offset: number;
          };
          particle.baseAngle += particle.speed;
          particle.position.x = Math.cos(particle.baseAngle) * particle.radius;
          particle.position.y = Math.sin(particle.baseAngle) * particle.radius * 0.6;
          particle.position.z = Math.sin(particle.baseAngle * 2 + particle.offset) * 8;
        }
      });

      // Rotate core
      core.rotation.x = t * 0.3;
      core.rotation.y = t * 0.5;
      innerCore.rotation.x = -t * 0.2;
      innerCore.rotation.y = -t * 0.3;

      // Pulse core
      const coreScale = 1 + Math.sin(t * 2) * 0.1;
      core.scale.set(coreScale, coreScale, coreScale);

      // Update data particles
      const dataPosAttr = dataGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < dataParticleCount; i++) {
        const vel = dataVelocities[i];
        let x = dataPosAttr.getX(i) + vel.x;
        let y = dataPosAttr.getY(i) + vel.y;
        let z = dataPosAttr.getZ(i) + vel.z;
        
        // Wrap around
        if (Math.abs(x) > 100) vel.x *= -1;
        if (Math.abs(y) > 75) vel.y *= -1;
        if (Math.abs(z) > 50) vel.z *= -1;
        
        dataPosAttr.setXYZ(i, x, y, z);
      }
      dataPosAttr.needsUpdate = true;

      // Rotate stars
      stars.rotation.y = t * 0.03;
      stars.rotation.x = t * 0.01;

      // Nebula drift
      nebulaGroup.rotation.z = t * 0.02;
      nebulaGroup.children.forEach((child, i) => {
        child.position.x += Math.sin(t * 0.3 + i) * 0.04;
        child.position.y += Math.cos(t * 0.25 + i) * 0.03;
      });

      // Pulsing lights
      pointLight1.intensity = 3 + Math.sin(t * 3) * 1;
      pointLight2.intensity = 3 + Math.cos(t * 2.5) * 1;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduced) window.addEventListener("pointermove", onPointerMove);
    
    if (!reduced) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);

      frameGeo.dispose();
      frameMat.dispose();
      borderGeo.dispose();
      borderMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      dataGeo.dispose();
      dataMat.dispose();
      accentTexture.dispose();
      violetTexture.dispose();
      whiteTexture.dispose();
      
      cards.forEach((card) => {
        card.children.forEach((child) => {
          (child as THREE.Mesh).geometry.dispose();
          (child as THREE.Mesh).material.dispose();
        });
      });
      
      nebulaGroup.children.forEach((child) => {
        (child as THREE.Sprite).material.dispose();
      });
      
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [projects]);

  return <div ref={mountRef} className={`absolute inset-0 ${className}`} />;
}
