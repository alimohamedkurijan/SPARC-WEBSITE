"use client";

import Hero from "@/components/Hero";
import ProcessSection from "@/components/ProcessSection";
import StatsSection from "@/components/StatsSection";
import GamesSection from "@/components/GamesSection";
import AboutSection from "@/components/AboutSection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const handleJoinUsClick = () => {
    // This will be connected to backend later
    console.log("Join Us clicked - will connect to backend");
    // You can add modal, form, or redirect here
  };

  return (
    <main className="min-h-screen relative">
      <Header />
      <Hero onJoinUsClick={handleJoinUsClick} />
      <ProcessSection />
      <StatsSection />
      <GamesSection />
      <AboutSection />
      <Footer />
    </main>
  );
}
