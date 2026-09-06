export interface JourneyStep {
  year: string;
  role: string;
  org: string;
  desc: string;
}

export const journeySteps: JourneyStep[] = [
  {
    year: "2024 — Now",
    role: "Lead Creative Developer",
    org: "Independent Studio",
    desc: "以独立工作室的形式与全球品牌合作，主导从概念到上线的沉浸式 Web 体验，专注 WebGL、动效系统与性能工程。",
  },
  {
    year: "2021 — 2024",
    role: "Senior Frontend Engineer",
    org: "Digital Agency · Shanghai",
    desc: "负责多个 Awwwards 级别项目的前端架构与交互实现，建立团队动效规范，将平均 LCP 优化 40%。",
  },
  {
    year: "2019 — 2021",
    role: "Frontend Developer",
    org: "Tech Startup",
    desc: "从 0 到 1 搭建产品前端与设计系统，深度参与产品设计决策，理解商业与体验的平衡艺术。",
  },
  {
    year: "2015 — 2019",
    role: "B.Eng. Digital Media Technology",
    org: "University",
    desc: "系统学习计算机图形学、交互设计与视觉传达，在毕业设计中首次尝试将 Shader 艺术带入 Web。",
  },
];
