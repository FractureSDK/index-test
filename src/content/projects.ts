/**
 * Projects / Work configuration
 */

export interface Project {
  n: string;
  title: string;
  tag: string;
  year: string;
  desc: string;
  img: string;
  color: string;
}

export const projects: Project[] = [
  {
    n: "01",
    title: "Liquid Chrome",
    tag: "WebGL · Brand Experience",
    year: "2025",
    desc: "为一家新锐科技品牌打造的沉浸式官网。基于自定义 GLSL 着色器的流体金属材质，随鼠标实时形变，配合音频响应式动效。",
    img: "/images/p1.jpg",
    color: "#6d4bff",
  },
  {
    n: "02",
    title: "Nova Finance",
    tag: "Product Design · React",
    year: "2024",
    desc: "面向下一代投资者的金融看板。实时数据可视化、微交互驱动的信息层级，把复杂决策变得轻盈直观。",
    img: "/images/p2.jpg",
    color: "#c8ff3d",
  },
  {
    n: "03",
    title: "Particle Symphony",
    tag: "Generative Art · Three.js",
    year: "2024",
    desc: "一场由 200 万粒子组成的实时视觉交响。GPU 计算驱动的粒子系统，在浏览器中演绎数据与音乐的共舞。",
    img: "/images/p3.jpg",
    color: "#ff6b9d",
  },
  {
    n: "04",
    title: "Maison Éditorial",
    tag: "E-Commerce · Motion",
    year: "2023",
    desc: "高定时装品牌的数字旗舰店。以杂志般的编排节奏、页面转场与滚动叙事，重塑奢侈品线上购物的仪式感。",
    img: "/images/p4.jpg",
    color: "#f4f1ea",
  },
];
