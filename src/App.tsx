import { useState } from "react";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import Preloader from "./components/Preloader";
import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Work from "./components/Work";
import Skills from "./components/Skills";
import Journey from "./components/Journey";
import Contact from "./components/Contact";

export default function App() {
  const [ready, setReady] = useState(false);
  useSmoothScroll(ready);

  return (
    <div className="relative bg-ink text-bone">
      <Preloader onDone={() => setReady(true)} />
      <Cursor />
      {ready && <Nav />}
      <main>
        <Hero start={ready} />
        <Marquee />
        <About />
        <Work />
        <Marquee reverse outline />
        <Skills />
        <Journey />
        <Contact />
      </main>
    </div>
  );
}
