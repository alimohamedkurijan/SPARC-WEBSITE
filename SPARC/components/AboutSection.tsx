"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface AboutContent {
  id: string;
  section_key: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  points: string[];
  display_order: number;
}

// Default features as fallback
const defaultFeatures = [
  {
    title: "Welcome to SPARC",
    subtitle: "An Amazing Boost to your Journey",
    description: "Empowering Your Path - Learn about how SPARC adds a boost to your journey by providing clear guidance and direction in robotics and programming.",
    image: "/images/about-1.jpg",
    points: [
      "Hands-on robotics projects and competitions",
      "Expert mentorship from industry professionals",
      "State-of-the-art facilities and equipment",
    ],
  },
  {
    title: "Our Philosophy",
    subtitle: "Able to Enable",
    description: "We believe in enabling the potential in every individual, regardless of your academic background, current experience and interests. Join a community that values innovation and creativity.",
    image: "/images/about-2.jpg",
    points: [
      "Build real-world projects and solutions",
      "Collaborate with passionate peers",
      "Develop skills for future careers in tech",
    ],
  },
];

export default function AboutSection() {
  const [features, setFeatures] = useState<AboutContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutContent = async () => {
      const { data } = await supabase
        .from('about_content')
        .select('*')
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        setFeatures(data);
      }
      setLoading(false);
    };

    fetchAboutContent();
  }, []);

  // Use database content or fall back to defaults
  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  return (
    <section id="about" className="py-20 lg:py-32">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="neo-chip px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            Student Programming and Robotics Club
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            About{" "}
            <span className="text-[#22d3ee]">SPARC</span>
          </h2>
        </div>

        <div className="max-w-6xl mx-auto space-y-24">
          {displayFeatures.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "grid md:grid-cols-2 gap-12 items-center",
                index % 2 === 1 && "md:grid-cols-[1fr_1fr]"
              )}
            >
              {/* Text Content */}
              <div className={cn(
                "space-y-6",
                index % 2 === 1 && "md:order-2"
              )}>
                <span className="neo-chip px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                  {feature.subtitle}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold grad-text">
                  {feature.title}
                </h3>
                <p className="text-lg text-[#ffffff]/75 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-3 pt-4">
                  {feature.points?.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-[#22d3ee] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-lg text-[#ffffff]/75">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image */}
              <div className={cn(
                "neo-card overflow-hidden rounded-2xl",
                index % 2 === 1 && "md:order-1"
              )}>
                <div className="aspect-square relative bg-[#141019]">
                  {feature.image ? (
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4f8cff] to-[#22d3ee]" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
