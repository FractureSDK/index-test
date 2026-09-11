"use client";

import { site } from "@/config/site";
import { SplitReveal, FadeUp } from "./Reveal";
import Magnetic from "./Magnetic";

export default function Contact() {
  const mailHref = `mailto:${site.email}`;

  return (
    <section id="contact" className="relative px-6 py-28 md:px-10 md:py-40">
      <div className="section-mask" />
      <div className="grid gap-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-bone/40 font-mono text-xs tracking-[0.3em] uppercase">05 / Contact</p>
          <h2 className="font-display text-display mt-6 font-medium">
            <SplitReveal text="有想法？" />
            <br />
            <SplitReveal text="聊聊看。" />
          </h2>

          <Magnetic strength={0.2}>
            <a
              href={mailHref}
              data-cursor="Email"
              className="group font-display mt-8 inline-block text-2xl font-medium transition-[text-shadow] duration-300 hover:drop-shadow-[0_0_18px_var(--color-accent)] md:text-4xl"
            >
              <span className="relative">
                {site.email}
                <span className="bg-accent absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
              </span>
            </a>
          </Magnetic>

          <FadeUp className="text-bone/50 mt-8 max-w-sm text-sm leading-relaxed" delay={0.1}>
            目前接受 {site.acceptingFrom}{" "}
            起的新项目合作。无论是品牌官网、产品体验，还是一次纯粹的实验，都欢迎聊聊。
          </FadeUp>
        </div>

        <FadeUp className="md:col-span-5" delay={0.15}>
          <p className="text-bone/40 font-mono text-[10px] tracking-[0.3em] uppercase">Socials</p>
          <ul className="mt-3 space-y-2 text-lg">
            {site.social.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="Open"
                  className="group text-bone/70 hover:text-bone inline-flex items-center gap-2 transition-colors"
                >
                  <span className="bg-accent h-px w-0 transition-all duration-300 group-hover:w-4" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="text-bone/40 mt-10 font-mono text-[10px] tracking-[0.3em] uppercase">Location</p>
          <p className="text-bone/70 mt-3">
            {site.location.city}，{site.location.country === "CN" ? "中国" : site.location.country}
          </p>
          <p className="text-bone/50">
            {site.location.lat.toFixed(4)}° N, {site.location.lng.toFixed(4)}° E
          </p>

          <p className="text-bone/40 mt-6 font-mono text-[10px] tracking-[0.3em] uppercase">Status</p>
          <p className="text-bone/70 mt-3 inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
              <span className="bg-accent relative inline-flex h-2 w-2 rounded-full" />
            </span>
            {site.availableForWork ? "Open to opportunities" : "Currently booked"}
          </p>
        </FadeUp>
      </div>

      <div className="border-bone/10 text-bone/30 mt-24 flex flex-col items-center justify-between gap-4 border-t pt-8 font-mono text-xs md:flex-row">
        <span>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </span>
        <span>Built with Next.js · Three.js · GSAP · Lenis</span>
      </div>
    </section>
  );
}
