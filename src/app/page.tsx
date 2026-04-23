import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Demo from "@/components/Demo";
import Waitlist from "@/components/Waitlist";
import Pillars from "@/components/Pillars";
import HowItWorks from "@/components/HowItWorks";
import Gallery from "@/components/Gallery";
import Brand from "@/components/Brand";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Demo />
        <Waitlist />
        <Pillars />
        <HowItWorks />
        <Gallery />
        <Brand />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
