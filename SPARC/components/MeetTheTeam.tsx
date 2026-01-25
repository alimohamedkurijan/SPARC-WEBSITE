"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  email?: string;
  linkedin?: string;
  display_order: number;
  is_active: boolean;
}

interface MeetTheTeamProps {
  onJoinUsClick?: () => void;
}

// Default team members as fallback
const defaultTeamMembers = [
  {
    name: "Alex Johnson",
    role: "President",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    name: "Sarah Chen",
    role: "Vice President",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  },
  {
    name: "Michael Torres",
    role: "Treasurer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  },
  {
    name: "Emily Rodriguez",
    role: "Secretary",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  },
];

export default function MeetTheTeam({ onJoinUsClick }: MeetTheTeamProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const { data } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        setTeamMembers(data);
      }
      setLoading(false);
    };

    fetchTeamMembers();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5;
    const scrollDelay = 20;

    const autoScroll = () => {
      if (container) {
        scrollPosition += scrollSpeed;
        const maxScroll = container.scrollWidth - container.clientWidth;

        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }

        container.scrollLeft = scrollPosition;
      }
    };

    scrollIntervalRef.current = setInterval(autoScroll, scrollDelay);

    const handleMouseEnter = () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };

    const handleMouseLeave = () => {
      scrollIntervalRef.current = setInterval(autoScroll, scrollDelay);
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Use database members or fall back to defaults
  const displayMembers = teamMembers.length > 0 ? teamMembers : defaultTeamMembers;

  return (
    <section id="team" className="relative py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Meet The Team
          </h2>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Get to know the passionate individuals leading SPARC and driving our mission forward.
          </p>
        </div>

        {/* Horizontal Scrolling Container */}
        <div className="mb-16">
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-none"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {displayMembers.map((member, index) => (
              <div
                key={member.id || index}
                className={cn(
                  "group relative bg-white rounded-xl overflow-hidden flex-shrink-0",
                  "border-2 border-[#C02026]/20 hover:border-[#CF8420] transition-all",
                  "shadow-md hover:shadow-xl transition-all duration-300",
                  "w-64"
                )}
              >
                <div className="aspect-square relative overflow-hidden bg-[#D9D9D9]">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className={cn(
                        "w-full h-full object-cover transition-transform duration-500",
                        "group-hover:scale-110"
                      )}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=C02026&color=fff&size=400`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C02026] to-[#CF8420]">
                      <span className="text-white text-6xl font-bold">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-[#CF8420] transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs font-medium text-[#CF8420] uppercase tracking-wide">
                    {member.role}
                  </p>
                  {member.bio && (
                    <p className="text-xs text-gray-600 line-clamp-2 mt-2">{member.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={onJoinUsClick}
            size="lg"
            className={cn(
              "px-8 py-6 text-base font-semibold rounded-xl",
              "bg-[#CF8420] hover:bg-[#CF8420]/90 text-white",
              "shadow-lg hover:shadow-xl transition-all duration-300",
              "hover:scale-105 active:scale-95"
            )}
          >
            Join Our Team
          </Button>
        </div>
      </div>
    </section>
  );
}
