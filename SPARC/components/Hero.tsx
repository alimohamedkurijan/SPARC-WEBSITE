"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroProps {
  onJoinUsClick?: () => void;
}

export default function Hero({ onJoinUsClick }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: "url('/images/Campaign-NOV2025-01 1.png')",
        }}
      />

      {/* Overlay - Darker for better text visibility */}
      <div className="absolute inset-0 bg-black/70 z-10" />

      {/* Content - Centered */}
      <div className="relative z-20 container mx-auto px-6 lg:px-8 py-12 md:py-16 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Main Headline - Bold & Impactful */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-tight drop-shadow-2xl">
            Master{" "}
            <span className="text-[#CF8420] drop-shadow-2xl">Robotics</span> &{" "}
            <span className="text-[#CF8420] drop-shadow-2xl">Programming</span>
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed font-light italic drop-shadow-lg">
            Join SPARC - Where innovation meets hands-on learning
          </p>

          {/* CTA Button - Prominent */}
          <div className="pt-6">
            <Button
              onClick={onJoinUsClick}
              size="lg"
              className={cn(
                "px-10 py-6 text-lg md:text-xl font-bold rounded-full",
                "bg-[#CF8420] hover:bg-[#CF8420]/90 text-white",
                "transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-[#CF8420]/50"
              )}
            >
              Join SPARC Today!
            </Button>
          </div>

          {/* Supporting Points */}
          <div className="pt-8 flex flex-wrap justify-center gap-6 md:gap-8 text-white text-base md:text-lg drop-shadow-lg">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-[#CF8420]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Hands-On Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-[#CF8420]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Industry Mentors</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-[#CF8420]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Competition Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
