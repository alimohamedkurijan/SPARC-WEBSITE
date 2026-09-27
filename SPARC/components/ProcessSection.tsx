"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import Image from "next/image";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  spots: number;
  deadline: string;
  is_featured: boolean;
}

export default function ProcessSection() {
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!supabaseEnabled) {
        setLoading(false);
        return;
      }

      const { data: events } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0]) // Only future events
        .order('date', { ascending: true });

      if (events && events.length > 0) {
        // Find the featured event (is_featured = true)
        const featured = events.find((e: Event) => e.is_featured);

        // If no featured event, use the first upcoming event
        setFeaturedEvent(featured || events[0]);

        // Get other events (exclude the featured one)
        const others = events.filter((e: Event) =>
          featured ? e.id !== featured.id : e.id !== events[0].id
        );
        setUpcomingEvents(others);
      }

      setLoading(false);
    };

    fetchEvents();
  }, []);

  const handleApply = (eventTitle: string) => {
    console.log(`Apply clicked for: ${eventTitle}`);
    // TODO: Connect to registration system
  };

  if (loading) {
    return (
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl text-[#ffffff]/70">Loading events...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredEvent && upcomingEvents.length === 0) {
    return (
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Upcoming <span className="grad-text">Events</span>
            </h2>
            <p className="text-xl text-[#ffffff]/70">
              No upcoming events at the moment. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Upcoming <span className="grad-text">Events</span>
          </h2>
          <p className="text-xl text-[#ffffff]/70">
            Join us and be part of something amazing!
          </p>
        </div>

        {/* Featured Event - Large Card */}
        {featuredEvent && (
          <div className="max-w-6xl mx-auto mb-16">
            <div className="neo-card overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative h-64 md:h-auto min-h-[400px] overflow-hidden">
                  {featuredEvent.image ? (
                    <Image
                      src={featuredEvent.image}
                      alt={featuredEvent.title}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        // Hide broken image, show fallback gradient
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'absolute inset-0 bg-gradient-to-br from-[#4f8cff] to-[#22d3ee]';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4f8cff] to-[#22d3ee]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-5 left-5">
                    <span className="neo-chip px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                      Featured Event
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold tracking-tight mb-5 text-[#ffffff]">
                      {featuredEvent.title}
                    </h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-[#ffffff]/70">
                        <svg className="w-5 h-5 text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold text-[#ffffff]">{new Date(featuredEvent.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#ffffff]/70">
                        <svg className="w-5 h-5 text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{featuredEvent.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#ffffff]/70">
                        <svg className="w-5 h-5 text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{featuredEvent.location}</span>
                      </div>
                    </div>

                    <p className="text-[#ffffff]/70 leading-relaxed mb-5">
                      {featuredEvent.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-[#22d3ee] font-semibold">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Registration closes: {new Date(featuredEvent.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button
                      onClick={() => handleApply(featuredEvent.title)}
                      className="neo-btn neo-btn-primary w-full py-3 px-5 text-sm"
                    >
                      Register Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Events - Grid of Cards */}
        {upcomingEvents.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl lg:text-3xl font-bold tracking-tight mb-8 text-[#ffffff]">More <span className="grad-text">Events</span></h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "neo-card",
                    "p-6 flex flex-col"
                  )}
                >
                  <div className="flex-1">
                    <h4 className="text-lg lg:text-xl font-bold tracking-tight mb-3 text-[#ffffff]">
                      {event.title}
                    </h4>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[#ffffff]/70">
                        <svg className="w-4 h-4 text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold text-[#ffffff]">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#ffffff]/70">
                        <svg className="w-4 h-4 text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#ffffff]/70">
                        <svg className="w-4 h-4 text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <p className="text-[#ffffff]/70 text-sm leading-relaxed mb-4">
                      {event.description}
                    </p>

                    <div className="neo-chip px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                      {event.spots} spots available
                    </div>
                  </div>

                  <Button
                    onClick={() => handleApply(event.title)}
                    className="neo-btn neo-btn-primary w-full mt-5 py-3 px-5 text-sm"
                  >
                    Apply Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
