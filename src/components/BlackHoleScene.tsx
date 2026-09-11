"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * A real per-pixel geodesic ray-marcher, not a particle trick — ported
 * from the technique in zhiqiangme/Black_Hole (github.com/zhiqiangme/Black_Hole),
 * itself built on the "starless" weak-field approximation for bent null
 * geodesics around a Schwarzschild black hole (a = -1.5·h²·r / |r|⁵, where
 * h = |r×v| is the conserved specific angular momentum). Every camera ray
 * is integrated step by step; the lensed disk arcs above/below the shadow,
 * the photon ring, and the disk's own silhouette all fall out of that one
 * integration loop rather than being separately faked with extra meshes.
 *
 * Adapted for this use (a decorative Hero background inside a scrollable
 * page), not reproduced as-is:
 *  - No OrbitControls drag-to-orbit and no scroll-wheel-driven "plunge into
 *    the horizon" — this canvas sits inside a normal scrolling portfolio
 *    page, so hijacking the wheel isn't an option. Orbit is a slow
 *    auto-rotate plus subtle pointer parallax instead, and disk intensity/
 *    ring gain ramp gently with normal page scroll rather than owning it.
 *  - No background starfield/nebula sampling for escaped rays — alpha is 0
 *    there instead, so the site's own dark background shows through
 *    (matches an earlier decision in this project to drop starfield
 *    dressing). Captured rays (fell past the horizon) render opaque black;
 *    only rays that actually cross the disk plane accumulate color.
 *  - Step count / internal render scale taper by breakpoint, consistent
 *    with this project's existing mobile-downgrade convention (this
 *    component is only ever mounted on desktop to begin with — see
 *    HeroBackground.tsx).
 */
export default function BlackHoleScene({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tier = window.innerWidth < 1280 ? "compact" : "full";
    const maxSteps = tier === "compact" ? 170 : 280;
    const renderScale = tier === "compact" ? 0.55 : 0.8;

    // ---------------------------- renderer + fullscreen quad ----------------------------
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const quadScene = new THREE.Scene();
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Rs (Schwarzschild radius) = 1 is the length unit throughout, per the
    // source project's convention.
    const DISK_IN = 2.6;
    const DISK_OUT = 9.2;

    const vertexShader = /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `;

    const fragmentShader = /* glsl */ `
      precision highp float;
      varying vec2 vUv;

      uniform vec3 uCamPos;
      uniform mat3 uCamBasis;
      uniform float uAspect;
      uniform float uFovTan;
      uniform float uTime;
      uniform float uSteps;
      uniform float uHeat;
      uniform float uRingGain;

      const float DISK_IN = ${DISK_IN.toFixed(2)};
      const float DISK_OUT = ${DISK_OUT.toFixed(2)};
      const float ESCAPE_R2 = 900.0;

      float hash(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 34.7);
        return fract(p.x * p.y);
      }

      float valueNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      // fractal Brownian motion: several octaves of value noise, each half
      // the amplitude and roughly double the frequency of the last — this
      // is what gives the disk its filament/turbulence texture rather than
      // a smooth gradient
      float fbm(vec2 p) {
        float sum = 0.0;
        float amp = 0.55;
        for (int i = 0; i < 5; i++) {
          sum += amp * valueNoise(p);
          p = p * 2.02 + vec2(17.0, 9.0);
          amp *= 0.5;
        }
        return sum;
      }

      // rgb = emitted light, a = opacity at this point on the disk
      vec4 sampleDisk(vec3 hitPos, float r, vec3 rayDir) {
        float rNorm = clamp((r - DISK_IN) / (DISK_OUT - DISK_IN), 0.0, 1.0);

        // Keplerian differential rotation: inner material both orbits and
        // visually shears past outer material, angular speed falls off as r^-1.5
        float omega = 0.85 / pow(r, 1.5);
        float phase = uTime * omega;
        float cs = cos(phase), sn = sin(phase);
        vec2 sheared = mat2(cs, -sn, sn, cs) * hitPos.xz;
        float turbulence = pow(fbm(sheared * (2.6 + 4.0 * (1.0 - rNorm))), 1.7);

        // temperature gradient: white-hot inner edge cooling to dim red outward
        vec3 cool = vec3(0.38, 0.08, 0.02);
        vec3 mid = vec3(1.0, 0.56, 0.2);
        vec3 hot = vec3(1.0, 0.97, 0.9);
        vec3 base = mix(cool, mid, smoothstep(0.0, 0.5, 1.0 - rNorm));
        base = mix(base, hot, smoothstep(0.5, 1.0, 1.0 - rNorm));
        base = mix(base, hot, uHeat * 0.7 * smoothstep(0.1, 0.85, 1.0 - rNorm));

        // Doppler beaming: material orbiting toward the camera reads
        // brighter (and whiter) than material orbiting away
        vec3 tangent = normalize(vec3(hitPos.z, 0.0, -hitPos.x));
        float approach = dot(tangent, -rayDir);
        float beam = pow(clamp(1.0 + 0.6 * approach, 0.3, 2.0), 2.2);

        float edgeFade = smoothstep(DISK_IN * 0.95, DISK_IN * 1.15, r) * (1.0 - smoothstep(DISK_OUT * 0.6, DISK_OUT, r));
        float brightness = (0.12 + turbulence) * beam * edgeFade;
        brightness *= mix(0.4, 1.3 + uHeat * 0.6, pow(1.0 - rNorm, 1.6));

        float alpha = clamp(turbulence * edgeFade, 0.0, 0.85);
        return vec4(base * brightness, alpha);
      }

      void main() {
        vec2 ndc = vUv * 2.0 - 1.0;
        vec3 rayDir = normalize(uCamBasis * vec3(ndc.x * uAspect * uFovTan, ndc.y * uFovTan, -1.0));

        vec3 pos = uCamPos;
        vec3 vel = rayDir;
        vec3 hVec = cross(pos, vel);
        float h2 = dot(hVec, hVec);

        vec3 accum = vec3(0.0);
        float transmittance = 1.0;
        float minRadius = 1e4;
        bool captured = false;

        for (int i = 0; i < 320; i++) {
          if (float(i) >= uSteps) break;
          float r2 = dot(pos, pos);
          float r = sqrt(r2);
          minRadius = min(minRadius, r);

          if (r < 1.0) {
            captured = true;
            break;
          }
          if (r2 > ESCAPE_R2 && dot(pos, vel) > 0.0) break;

          float dt = clamp(0.13 * (r - 1.0), 0.04, 0.4);
          // starless weak-field bending approximation for a null geodesic
          vec3 accel = -1.5 * h2 * pos / (r2 * r2 * r);
          vel += accel * dt;
          vec3 nextPos = pos + vel * dt;

          if (pos.y * nextPos.y < 0.0) {
            float mixT = pos.y / (pos.y - nextPos.y);
            vec3 hit = mix(pos, nextPos, mixT);
            float rHit = length(hit.xz);
            if (rHit > DISK_IN * 0.9 && rHit < DISK_OUT) {
              vec4 disk = sampleDisk(hit, rHit, normalize(vel));
              accum += transmittance * disk.rgb;
              transmittance *= 1.0 - disk.a;
              if (transmittance < 0.02) break;
            }
          }
          pos = nextPos;
        }

        // photon ring: rays that wind tightly around r ≈ 1.5 (the photon
        // sphere) before escaping or being captured pick up a thin bright rim
        float ringGlow = exp(-pow((minRadius - 1.5) * 2.5, 2.0));
        accum += vec3(1.0, 0.86, 0.62) * ringGlow * (0.08 + 0.3 * uRingGain);

        if (captured) {
          // opaque event-horizon shadow — occludes whatever's behind it,
          // including any disk light already accumulated in front of it
          gl_FragColor = vec4(accum, 1.0);
        } else if (transmittance > 0.985 && ringGlow < 0.02) {
          // ray escaped without touching the disk or the photon sphere —
          // fully transparent so the page's own background shows through
          // instead of a painted starfield
          gl_FragColor = vec4(accum, 0.0);
        } else {
          gl_FragColor = vec4(accum, clamp(1.0 - transmittance + ringGlow, 0.0, 1.0));
        }
      }
    `;

    const uniforms = {
      uCamPos: { value: new THREE.Vector3() },
      uCamBasis: { value: new THREE.Matrix3() },
      uAspect: { value: 1 },
      uFovTan: { value: Math.tan(THREE.MathUtils.degToRad(27.5)) },
      uTime: { value: 0 },
      uSteps: { value: maxSteps },
      uHeat: { value: 0.35 },
      uRingGain: { value: 0.3 },
    };

    const quadMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      })
    );
    quadMesh.frustumCulled = false;
    quadScene.add(quadMesh);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(quadScene, quadCamera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.35, 0.55);
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // a plain camera object purely as a math convenience — never rendered,
    // just holds position/orientation so its matrixWorld gives us the
    // right/up/back basis vectors for the shader each frame
    const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
    const azimuth = -0.35;
    const elevation = 0.28;
    const distance0 = 17;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.tx = (e.clientX - rect.left) / rect.width - 0.5;
      pointer.ty = (e.clientY - rect.top) / rect.height - 0.5;
    };

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      uniforms.uAspect.value = w / Math.max(h, 1);
      const pr = Math.min(window.devicePixelRatio || 1, 2) * renderScale;
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false);
      composer.setPixelRatio(pr);
      composer.setSize(w, h);
      bloomPass.setSize(w, h);
    };

    let raf = 0;
    let inView = true;
    let t = 0;
    const m3 = new THREE.Matrix3();

    const renderOnce = () => composer.render();

    const frame = () => {
      t += 0.01;
      pointer.x += (pointer.tx - pointer.x) * 0.03;
      pointer.y += (pointer.ty - pointer.y) * 0.03;

      const az = azimuth + t * 0.015 + pointer.x * 0.5;
      const el = elevation + pointer.y * 0.25;
      const dist = distance0 - scrollRef.current * 4;

      cam.position.set(
        Math.sin(az) * Math.cos(el) * dist,
        Math.sin(el) * dist,
        Math.cos(az) * Math.cos(el) * dist
      );
      cam.lookAt(0, 0, 0);
      cam.updateMatrixWorld();

      uniforms.uCamPos.value.copy(cam.position);
      const e = cam.matrixWorld.elements;
      m3.set(e[0], e[4], e[8], e[1], e[5], e[9], e[2], e[6], e[10]);
      uniforms.uCamBasis.value.copy(m3);
      uniforms.uTime.value = t;
      uniforms.uHeat.value = 0.35 + scrollRef.current * 0.35;
      uniforms.uRingGain.value = 0.3 + scrollRef.current * 0.4;

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
    if (reduced) {
      cam.position.set(
        Math.sin(azimuth) * distance0,
        Math.sin(elevation) * distance0,
        Math.cos(azimuth) * distance0
      );
      cam.lookAt(0, 0, 0);
      cam.updateMatrixWorld();
      uniforms.uCamPos.value.copy(cam.position);
      const e = cam.matrixWorld.elements;
      m3.set(e[0], e[4], e[8], e[1], e[5], e[9], e[2], e[6], e[10]);
      uniforms.uCamBasis.value.copy(m3);
    }
    renderOnce();
    if (!reduced) raf = requestAnimationFrame(frame);

    window.addEventListener("resize", resize);
    if (!reduced) window.addEventListener("pointermove", onPointerMove);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      quadMesh.geometry.dispose();
      (quadMesh.material as THREE.ShaderMaterial).dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mountRef} className={`block h-full w-full ${className}`} />;
}
