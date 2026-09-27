"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  email: string;
  linkedin: string;
  display_order: number;
  is_active: boolean;
}

export default function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const { data } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data) {
        setMembers(data);
      }
      setLoading(false);
    };

    fetchTeamMembers();
  }, []);

  // Don't render if no team members
  if (!loading && members.length === 0) {
    return null;
  }

  return (
    <section id="team" className="py-20 lg:py-32 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#4f8cff] mb-4">
            Meet The{" "}
            <span className="text-[#22d3ee]">Team</span>
          </h2>
          <p className="text-xl text-foreground/70">
            The passionate people behind SPARC
          </p>
        </div>

        {loading ? (
          <div className="text-center">
            <p className="text-gray-500">Loading team members...</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-transparent hover:border-[#22d3ee] transition-all duration-300 hover:shadow-xl group"
              >
                {/* Photo */}
                <div className="relative h-64 bg-gray-200 overflow-hidden">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4f8cff] to-[#22d3ee] flex items-center justify-center">
                      <span className="text-white text-6xl font-bold">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-[#22d3ee] font-semibold text-sm mb-3">{member.role}</p>
                  {member.bio && (
                    <p className="text-gray-600 text-sm line-clamp-3">{member.bio}</p>
                  )}

                  {/* Social Links */}
                  {(member.email || member.linkedin) && (
                    <div className="flex gap-3 mt-4">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[#22d3ee] hover:text-[#06121f] transition-colors"
                          title="Email"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[#0077B5] hover:text-white transition-colors"
                          title="LinkedIn"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
