"use client";

import { useEffect, useState } from "react";
import Magnetic from "./Magnetic";
import { navLinks } from "@/content/nav";
import { site } from "@/config/site";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: site.location.timezone,
        }).format(new Date())
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 transition-colors duration-500 md:px-10 ${
          scrolled ? "bg-ink/80 backdrop-blur-md" : ""
        }`}
      >
        <a href="#top" className="font-display text-sm font-semibold tracking-tight" data-cursor="Home">
          {site.name}
        </a>

        <nav className="font-body text-bone/70 hidden items-center gap-8 text-sm md:flex">
          {navLinks.map((l) => (
            <Magnetic key={l.href} strength={0.3}>
              <a href={l.href} className="hover:text-bone transition-colors" data-cursor={l.label}>
                <span className="text-bone/30 mr-1 text-[10px]">{l.n}</span>
                {l.label}
              </a>
            </Magnetic>
          ))}
        </nav>

        <div className="text-bone/50 hidden font-mono text-xs md:block">
          {site.location.city.toUpperCase()} {time}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="relative z-[60] flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`bg-bone h-px w-6 transition-transform duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
          />
          <span className={`bg-bone h-px w-6 transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
          <span
            className={`bg-bone h-px w-6 transition-transform duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
          />
        </button>
      </header>

      {/* mobile fullscreen menu */}
      <div
        className={`bg-ink fixed inset-0 z-40 flex flex-col justify-center px-8 transition-opacity duration-500 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-2">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-bone/10 font-display border-b py-4 text-4xl font-medium"
            >
              <span className="text-bone/30 mr-3 align-top text-sm">{l.n}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <p className="text-bone/40 mt-10 font-mono text-xs">
          {site.location.city}, {site.location.country} · {time}
        </p>
      </div>
    </>
  );
}
