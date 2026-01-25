"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
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

export default function AdminTeam() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    image: "",
    email: "",
    linkedin: "",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    const checkAuthAndFetchMembers = async () => {
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

      const { data } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true });

      if (data) {
        setMembers(data);
      }
      setLoading(false);
    };

    checkAuthAndFetchMembers();
  }, [router]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    setUploadingImage(true);
    try {
      const fileName = `team-${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (error) throw error;

      const publicUrl = supabase.storage
        .from('images')
        .getPublicUrl(data.path).data.publicUrl;

      setFormData({ ...formData, image: publicUrl });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMember) {
      const { data, error } = await supabase
        .from('team_members')
        .update(formData)
        .eq('id', editingMember.id)
        .select()
        .single();

      if (data) {
        setMembers(members.map(m => m.id === editingMember.id ? data : m));
      }
    } else {
      const { data, error } = await supabase
        .from('team_members')
        .insert([{ ...formData, display_order: members.length + 1 }])
        .select()
        .single();

      if (data) {
        setMembers([...members, data]);
      }
    }

    resetForm();
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio || '',
      image: member.image || '',
      email: member.email || '',
      linkedin: member.linkedin || '',
      display_order: member.display_order,
      is_active: member.is_active,
    });
    setImagePreview(member.image || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;

    await supabase.from('team_members').delete().eq('id', id);
    setMembers(members.filter(m => m.id !== id));
  };

  const handleToggleActive = async (member: TeamMember) => {
    const { data } = await supabase
      .from('team_members')
      .update({ is_active: !member.is_active })
      .eq('id', member.id)
      .select()
      .single();

    if (data) {
      setMembers(members.map(m => m.id === member.id ? data : m));
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingMember(null);
    setImagePreview("");
    setFormData({
      name: "",
      role: "",
      bio: "",
      image: "",
      email: "",
      linkedin: "",
      display_order: 0,
      is_active: true,
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading team members...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-2">Manage the Meet The Team section</p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-[#CF8420] hover:bg-[#CF8420]/90"
          >
            + Add Team Member
          </Button>
        </div>

        {/* Add/Edit Form */}
        {isFormOpen && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingMember ? "Edit Team Member" : "Add New Team Member"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CF8420] focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Role/Position *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CF8420] focus:border-transparent outline-none"
                    placeholder="e.g., President, Technical Lead"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CF8420] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CF8420] focus:border-transparent outline-none"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CF8420] focus:border-transparent outline-none"
                  placeholder="Short description about this team member..."
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
                <div className="flex gap-4 items-start">
                  {/* Preview */}
                  <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        👤
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#CF8420] file:text-white file:text-sm"
                      disabled={uploadingImage}
                    />
                    {uploadingImage && <p className="text-sm text-[#CF8420]">Uploading...</p>}

                    <div className="text-center text-gray-400 text-sm">— OR —</div>

                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CF8420] focus:border-transparent outline-none"
                      placeholder="Paste image URL"
                    />

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setFormData({ ...formData, image: "" });
                        }}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                  Show on website
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="bg-[#CF8420] hover:bg-[#CF8420]/90">
                  {editingMember ? "Update Member" : "Add Member"}
                </Button>
                <Button type="button" onClick={resetForm} className="bg-gray-500 hover:bg-gray-600">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
              <p className="text-gray-500">No team members yet. Add your first team member!</p>
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 ${
                  !member.is_active ? 'opacity-60' : ''
                }`}
              >
                {/* Photo */}
                <div className="relative h-48 bg-gray-200">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                      👤
                    </div>
                  )}
                  {!member.is_active && (
                    <div className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 rounded text-xs">
                      Hidden
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-[#C02026] text-white px-2 py-1 rounded text-xs">
                    #{member.display_order}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                  <p className="text-[#CF8420] font-semibold">{member.role}</p>
                  {member.bio && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{member.bio}</p>
                  )}
                  {member.email && (
                    <p className="text-xs text-gray-500 mt-2">📧 {member.email}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 flex gap-2">
                  <Button
                    onClick={() => handleEdit(member)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleToggleActive(member)}
                    className={`flex-1 text-sm ${
                      member.is_active
                        ? 'bg-gray-500 hover:bg-gray-600'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {member.is_active ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    onClick={() => handleDelete(member.id)}
                    className="bg-red-600 hover:bg-red-700 text-sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
