"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface Stat {
  id: string;
  stat_key: string;
  number: string;
  label: string;
  description: string;
  display_order: number;
}

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

export default function AdminSettings() {
  const router = useRouter();
  const [stats, setStats] = useState<Stat[]>([]);
  const [aboutSections, setAboutSections] = useState<AboutContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStats, setSavingStats] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/admin/login");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push("/admin/login");
        return;
      }

      // Fetch stats
      const { data: statsData } = await supabase
        .from('site_stats')
        .select('*')
        .order('display_order', { ascending: true });

      if (statsData) {
        setStats(statsData);
      }

      // Fetch about content
      const { data: aboutData } = await supabase
        .from('about_content')
        .select('*')
        .order('display_order', { ascending: true });

      if (aboutData) {
        setAboutSections(aboutData);
      }

      setLoading(false);
    };

    checkAuthAndFetchData();
  }, [router]);

  const handleStatChange = (id: string, field: keyof Stat, value: string) => {
    setStats(stats.map(stat =>
      stat.id === id ? { ...stat, [field]: value } : stat
    ));
  };

  const handleAboutChange = (id: string, field: keyof AboutContent, value: string | string[]) => {
    setAboutSections(aboutSections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const handlePointChange = (sectionId: string, pointIndex: number, value: string) => {
    setAboutSections(aboutSections.map(section => {
      if (section.id === sectionId) {
        const newPoints = [...section.points];
        newPoints[pointIndex] = value;
        return { ...section, points: newPoints };
      }
      return section;
    }));
  };

  const handleAddPoint = (sectionId: string) => {
    setAboutSections(aboutSections.map(section => {
      if (section.id === sectionId) {
        return { ...section, points: [...section.points, ''] };
      }
      return section;
    }));
  };

  const handleRemovePoint = (sectionId: string, pointIndex: number) => {
    setAboutSections(aboutSections.map(section => {
      if (section.id === sectionId) {
        const newPoints = section.points.filter((_, i) => i !== pointIndex);
        return { ...section, points: newPoints };
      }
      return section;
    }));
  };

  const handleImageUpload = async (sectionId: string, file: File) => {
    setUploadingImage(sectionId);
    try {
      const fileName = `about-${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (error) throw error;

      const publicUrl = supabase.storage
        .from('images')
        .getPublicUrl(data.path).data.publicUrl;

      handleAboutChange(sectionId, 'image', publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSaveStats = async () => {
    setSavingStats(true);
    try {
      for (const stat of stats) {
        await supabase
          .from('site_stats')
          .update({
            number: stat.number,
            label: stat.label,
            description: stat.description,
          })
          .eq('id', stat.id);
      }
      alert("Statistics updated successfully!");
    } catch (error) {
      console.error("Error saving stats:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSavingStats(false);
    }
  };

  const handleSaveAbout = async () => {
    setSavingAbout(true);
    try {
      for (const section of aboutSections) {
        await supabase
          .from('about_content')
          .update({
            title: section.title,
            subtitle: section.subtitle,
            description: section.description,
            image: section.image,
            points: section.points,
          })
          .eq('id', section.id);
      }
      alert("About sections updated successfully!");
    } catch (error) {
      console.error("Error saving about:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSavingAbout(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Website Settings</h1>
          <p className="text-gray-600 mt-2">Customize your website content</p>
        </div>

        {/* Our Numbers Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Our Numbers</h2>
              <p className="text-sm text-gray-600">Edit the statistics displayed on the homepage</p>
            </div>
            <Button
              onClick={handleSaveStats}
              disabled={savingStats}
              className="bg-[#22d3ee] hover:bg-[#22d3ee]/90"
            >
              {savingStats ? "Saving..." : "Save Statistics"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat) => (
              <div key={stat.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-[#4f8cff] rounded-lg flex items-center justify-center text-white font-bold">
                    {stat.display_order}
                  </div>
                  <span className="text-sm font-medium text-gray-500 uppercase">
                    {stat.stat_key.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Number/Value</label>
                    <input
                      type="text"
                      value={stat.number}
                      onChange={(e) => handleStatChange(stat.id, 'number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => handleStatChange(stat.id, 'label', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={stat.description}
                      onChange={(e) => handleStatChange(stat.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-black text-[#4f8cff]">{stat.number}</div>
                    <div className="text-sm font-bold text-gray-900">{stat.label}</div>
                    <div className="text-xs text-gray-500">{stat.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {stats.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No statistics found. Run <code className="bg-gray-100 px-2 py-1 rounded">add-stats-table.sql</code></p>
            </div>
          )}
        </div>

        {/* About SPARC Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">About SPARC</h2>
              <p className="text-sm text-gray-600">Edit the About section content and images</p>
            </div>
            <Button
              onClick={handleSaveAbout}
              disabled={savingAbout}
              className="bg-[#22d3ee] hover:bg-[#22d3ee]/90"
            >
              {savingAbout ? "Saving..." : "Save About Sections"}
            </Button>
          </div>

          <div className="space-y-6">
            {aboutSections.map((section) => (
              <div key={section.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-[#22d3ee] rounded-lg flex items-center justify-center text-[#06121f] font-bold">
                    {section.display_order}
                  </div>
                  <span className="text-sm font-medium text-gray-500 uppercase">
                    {section.section_key}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Content Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleAboutChange(section.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={section.subtitle || ''}
                        onChange={(e) => handleAboutChange(section.id, 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                      <textarea
                        value={section.description || ''}
                        onChange={(e) => handleAboutChange(section.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                      />
                    </div>

                    {/* Bullet Points */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Key Points</label>
                      <div className="space-y-2">
                        {section.points?.map((point, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={point}
                              onChange={(e) => handlePointChange(section.id, index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                              placeholder={`Point ${index + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePoint(section.id, index)}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddPoint(section.id)}
                          className="text-sm text-[#22d3ee] hover:underline"
                        >
                          + Add another point
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Section Image</label>
                    <div className="space-y-3">
                      {section.image && (
                        <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={section.image}
                            alt={section.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleAboutChange(section.id, 'image', '')}
                            className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(section.id, file);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#22d3ee] file:text-[#06121f] file:text-sm"
                          disabled={uploadingImage === section.id}
                        />
                        {uploadingImage === section.id && (
                          <p className="text-sm text-[#22d3ee] mt-1">Uploading...</p>
                        )}
                      </div>

                      <div className="text-center text-gray-400 text-sm">— OR —</div>

                      <input
                        type="url"
                        value={section.image || ''}
                        onChange={(e) => handleAboutChange(section.id, 'image', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                        placeholder="Paste image URL"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {aboutSections.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No about content found. Run <code className="bg-gray-100 px-2 py-1 rounded">add-about-team-tables.sql</code></p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
