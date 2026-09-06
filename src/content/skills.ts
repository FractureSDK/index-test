export interface SkillGroup {
  title: string;
  icon: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend",
    icon: "◈",
    items: ["React / Next.js", "TypeScript", "Vue / Nuxt", "Tailwind CSS", "Vite", "Web Components"],
  },
  {
    title: "Motion & 3D",
    icon: "◉",
    items: ["Three.js / R3F", "GLSL Shaders", "GSAP / Framer Motion", "WebGPU", "Lottie", "Canvas 2D"],
  },
  {
    title: "Design",
    icon: "◇",
    items: ["Figma", "Blender", "Design Systems", "Typography", "Prototyping", "Art Direction"],
  },
  {
    title: "Backend & Ops",
    icon: "◆",
    items: ["Node.js", "PostgreSQL", "Edge Functions", "GraphQL", "Netlify / Vercel", "CI/CD"],
  },
];

export const tools: string[] = [
  "React",
  "TypeScript",
  "Three.js",
  "GLSL",
  "GSAP",
  "Framer Motion",
  "Next.js",
  "Tailwind",
  "Blender",
  "Figma",
  "Node.js",
  "WebGPU",
  "Vite",
  "Lenis",
  "PostgreSQL",
  "Docker",
];
