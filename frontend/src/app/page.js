import HeroBackground from "@/components/HeroBackground";
import CursorEffect from "@/components/CursorEffect";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StoryInput from "@/components/StoryInput";
import HowItWorks from "@/components/HowItWorks";
import Showcase from "@/components/Showcase";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <HeroBackground />
      <CursorEffect />
      <Navbar />
      <main>
        <Hero />
        <StoryInput />
        <HowItWorks />
        <Showcase />
      </main>
      <Footer />
    </>
  );
}
