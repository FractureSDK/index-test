import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Work from "@/components/Work";
import Skills from "@/components/Skills";
import Journey from "@/components/Journey";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Work />
        <Skills />
        <Journey />
        <Contact />
      </main>
    </>
  );
}
