"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Stat {
  id: string;
  number: string;
  label: string;
  description: string;
  display_order: number;
}

// Default stats as fallback
const defaultStats = [
  { number: "560+", label: "Active Members", description: "Students" },
  { number: "96.3", label: "Success Rate", description: "%" },
  { number: "1090+", label: "Projects", description: "Completed" },
  { number: "6000+", label: "Hours", description: "Coaching & Collaboration" },
];

export default function StatsSection() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('site_stats')
        .select('*')
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        setStats(data);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  // Use database stats or fall back to defaults
  const displayStats = stats.length > 0 ? stats : defaultStats;

  return (
    <section className="py-20 lg:py-32 bg-[#D9D9D9]">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Numbers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {displayStats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                "text-center p-8 rounded-xl",
                "bg-white hover:shadow-lg hover:border-2 hover:border-[#CF8420] transition-all duration-300"
              )}
            >
              <div className="text-5xl md:text-6xl font-black text-[#C02026] mb-2">
                {stat.number}
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-lg text-foreground/60">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
