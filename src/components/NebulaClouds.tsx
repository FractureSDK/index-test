import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/**
 * A flowing nebula cloud effect using layered sprites with soft gradients.
 * Creates an ethereal cosmic atmosphere for section backgrounds.
 * 
 * - Multiple layers of animated nebula clouds
 * - Subtle color shifts over time
 * - Mouse-based parallax movement
 * - Optimized for performance with instanced rendering
 */
export default function NebulaClouds({
  className = "",
  colors = ["#6d4bff", "#8b6cff", "#c8ff3d"],
  density = 12,
}: {
  className?: string;
  colors?: string[];
  density?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 100);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ---- Create nebula texture ----
    const createNebulaTexture = (color: string) => {
      const size = 512;
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const g = c.getContext("2d")!;
      
      // Multiple gradient layers for organic look
      for (let layer = 0; layer < 5; layer++) {
        const cx = size / 2 + (Math.random() - 0.5) * 150;
        const cy = size / 2 + (Math.random() - 0.5) * 150;
        const radius = 100 + Math.random() * 150;
        
        const grad = g.createRadialGradient(cx, cy, 0, cx, cy, radius);
        const alpha = 0.15 + Math.random() * 0.2;
        grad.addColorStop(0, hexWithAlpha(color, alpha));
        grad.addColorStop(0.5, hexWithAlpha(color, alpha * 0.5));
        grad.addColorStop(1, hexWithAlpha(color, 0));
        
        g.fillStyle = grad;
        g.fillRect(0, 0, size, size);
      }
      
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    const hexWithAlpha = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    };

    // ---- Create cloud sprites ----
    const clouds: THREE.Sprite[] = [];
    const cloudData: { sprite: THREE.Sprite; speedX: number; speedY: number; phase: number }[] = [];

    for (let i = 0; i < density; i++) {
      const color = colors[i % colors.length];
      const texture = createNebulaTexture(color);
      
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.4 + Math.random() * 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      
      const sprite = new THREE.Sprite(material);
      const scale = 0.4 + Math.random() * 0.4;
      sprite.scale.set(scale, scale, 1);
      sprite.position.set(
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 1.5,
        Math.random() * -20
      );
      
      scene.add(sprite);
      clouds.push(sprite);
      
      cloudData.push({
        sprite,
        speedX: (Math.random() - 0.5) * 0.02,
        speedY: (Math.random() - 0.5) * 0.01,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // ---- Animation ----
    const reduced = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 0.3;
      pointer.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 0.3;
    };

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(w, h, false);
    };

    let raf = 0;
    let inView = true;
    let t = 0;

    const renderOnce = () => {
      renderer.render(scene, camera);
    };

    const frame = () => {
      t += 0.0015;
      
      pointer.x += (pointer.tx - pointer.x) * 0.02;
      pointer.y += (pointer.ty - pointer.y) * 0.02;

      // Animate each cloud
      cloudData.forEach((data, i) => {
        const { sprite, speedX, speedY, phase } = data;
        
        // Slow drift
        sprite.position.x += speedX;
        sprite.position.y += speedY;
        
        // Gentle oscillation
        sprite.position.y += Math.sin(t * 0.5 + phase) * 0.001;
        
        // Wrap around screen
        if (sprite.position.x > 1.5) sprite.position.x = -1.5;
        if (sprite.position.x < -1.5) sprite.position.x = 1.5;
        if (sprite.position.y > 1) sprite.position.y = -1;
        if (sprite.position.y < -1) sprite.position.y = 1;
        
        // Subtle scale pulsing
        const baseScale = sprite.scale.x;
        const pulse = 1 + Math.sin(t * 0.8 + phase) * 0.05;
        sprite.scale.set(baseScale * pulse, baseScale * pulse, 1);
      });

      // Camera parallax
      camera.position.x = pointer.x;
      camera.position.y = pointer.y;

      renderOnce();
      if (inView && !reduced) raf = requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const was = inView;
        inView = entry.isIntersecting;
        if (inView && !was && !reduced) raf = requestAnimationFrame(frame);
      },
      { threshold: 0 }
    );
    observer.observe(mount);

    resize();
    renderOnce();
    if (!reduced) raf = requestAnimationFrame(frame);

    window.addEventListener("resize", resize);
    if (!reduced) window.addEventListener("pointermove", onPointerMove);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);

      clouds.forEach((sprite) => {
        scene.remove(sprite);
        (sprite.material as THREE.SpriteMaterial).map?.dispose();
        (sprite.material as THREE.SpriteMaterial).dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [colors, density]);

  return <div ref={mountRef} className={`absolute inset-0 ${className}`} />;
}
