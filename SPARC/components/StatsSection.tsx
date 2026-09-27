"use client";

import { useEffect, useState } from "react";
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

  const displayStats = stats.length > 0 ? stats : defaultStats;

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-14 space-y-3">
          <span className="neo-chip px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]">
            By the numbers
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">
            Our <span className="grad-text">High Scores</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {displayStats.map((stat, index) => (
            <div key={index} className="neo-card p-8 text-center">
              <div className="font-display font-extrabold text-4xl md:text-5xl grad-text text-glow mb-3">
                {stat.number}
              </div>
              <div className="font-semibold text-[#ffffff] mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-[#ffffff]/50">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
