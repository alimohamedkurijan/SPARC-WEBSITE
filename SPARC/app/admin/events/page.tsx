"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

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

export default function AdminEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    image: "",
    spots: 0,
    deadline: "",
    is_featured: false,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    const checkAuthAndFetchEvents = async () => {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/admin/login");
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push("/admin/login");
        return;
      }

      // Fetch events from Supabase
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (data) {
        setEvents(data);
      }
    };

    checkAuthAndFetchEvents();
  }, [router]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return null;

    setUploadingImage(true);
    try {
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, selectedFile);

      if (error) {
        console.error("Upload error:", error);
        alert("Failed to upload image. Please try again.");
        setUploadingImage(false);
        return null;
      }

      if (data) {
        const publicUrl = supabase.storage
          .from('images')
          .getPublicUrl(data.path).data.publicUrl;

        setUploadingImage(false);
        return publicUrl;
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
      setUploadingImage(false);
      return null;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = formData.image;

    // Upload image if a new file was selected
    if (selectedFile) {
      const uploadedUrl = await handleImageUpload();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    const eventData = { ...formData, image: imageUrl };

    if (editingEvent) {
      // Update existing event
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingEvent.id)
        .select()
        .single();

      if (data) {
        setEvents(events.map(evt =>
          evt.id === editingEvent.id ? data : evt
        ));
      }
    } else {
      // Add new event
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (data) {
        setEvents([...events, data]);
      }
    }

    // Reset form
    setIsFormOpen(false);
    setEditingEvent(null);
    setSelectedFile(null);
    setImagePreview("");
    setFormData({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      image: "",
      spots: 0,
      deadline: "",
      is_featured: false,
    });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      image: event.image,
      spots: event.spots,
      deadline: event.deadline,
      is_featured: event.is_featured,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await supabase
        .from('events')
        .delete()
        .eq('id', id);

      setEvents(events.filter(evt => evt.id !== id));
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
    setSelectedFile(null);
    setImagePreview("");
    setFormData({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      image: "",
      spots: 0,
      deadline: "",
      is_featured: false,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
            <p className="text-gray-600 mt-2">Create and manage club events</p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-[#22d3ee] hover:bg-[#22d3ee]/90"
          >
            + Add New Event
          </Button>
        </div>

        {/* Event Form */}
        {isFormOpen && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingEvent ? "Edit Event" : "Add New Event"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Available Spots *
                  </label>
                  <input
                    type="number"
                    value={formData.spots}
                    onChange={(e) => setFormData({ ...formData, spots: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Registration Deadline *
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Image
                </label>
                <div className="space-y-3">
                  {/* File Upload */}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#22d3ee] file:text-[#06121f] hover:file:bg-[#22d3ee]/90"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload an image file (JPG, PNG, etc.) - Best for featured events
                    </p>
                  </div>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview("");
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* OR divider */}
                  {!imagePreview && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="text-sm text-gray-500">OR</span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>
                  )}

                  {/* URL Input */}
                  {!imagePreview && (
                    <div>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                        placeholder="Or paste image URL (https://example.com/image.jpg)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Paste a direct image URL from the web
                      </p>
                    </div>
                  )}

                  {uploadingImage && (
                    <p className="text-sm text-[#22d3ee] font-semibold">Uploading image...</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 text-[#22d3ee] focus:ring-[#22d3ee] border-gray-300 rounded"
                />
                <label htmlFor="featured" className="text-sm font-semibold text-gray-700">
                  Featured Event (displays as large card on homepage)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-[#22d3ee] hover:bg-[#22d3ee]/90"
                >
                  {editingEvent ? "Update Event" : "Create Event"}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">All Events</h2>
          {events.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
              <p className="text-gray-500">No events yet. Create your first event!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                        {event.is_featured && (
                          <span className="px-3 py-1 bg-[#22d3ee] text-[#06121f] text-xs font-semibold rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📅 {new Date(event.date).toLocaleDateString()} at {event.time}</p>
                        <p>📍 {event.location}</p>
                        <p>👥 {event.spots} spots available</p>
                        <p>⏰ Registration deadline: {new Date(event.deadline).toLocaleDateString()}</p>
                        <p className="mt-2 text-gray-700">{event.description}</p>
                        {event.image && (
                          <p className="text-blue-600 truncate">🖼️ {event.image}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleEdit(event)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(event.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
