"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface ImageFile {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  category: "hero" | "events" | "about" | "team" | "gallery" | "other";
  size: string;
}

export default function AdminImages() {
  const router = useRouter();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchImages = async () => {
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

      // Fetch images from Supabase Storage
      const { data: files } = await supabase
        .storage
        .from('images')
        .list();

      if (files) {
        const imageList = files
          .filter((file: { name: string }) => file.name !== '.emptyFolderPlaceholder')
          .map((file: { id: string; name: string; created_at: string; metadata?: { size?: number } }) => ({
            id: file.id,
            name: file.name,
            url: supabase.storage.from('images').getPublicUrl(file.name).data.publicUrl,
            uploadedAt: file.created_at,
            category: 'other' as const,
            size: `${((file.metadata?.size ?? 0) / 1024 / 1024).toFixed(2)} MB`,
          }));
        setImages(imageList);
      }
    };

    checkAuthAndFetchImages();
  }, [router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('images')
          .upload(fileName, file);

        if (error) {
          console.error("Upload error:", error);
          continue;
        }

        if (data) {
          const publicUrl = supabase.storage
            .from('images')
            .getPublicUrl(data.path).data.publicUrl;

          const newImage: ImageFile = {
            id: Date.now().toString(),
            name: file.name,
            url: publicUrl,
            uploadedAt: new Date().toISOString(),
            category: 'other',
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          };

          setImages([newImage, ...images]);
        }
      }

      alert("Images uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleCategoryChange = async (imageId: string, newCategory: ImageFile["category"]) => {
    setImages(images.map(img =>
      img.id === imageId ? { ...img, category: newCategory } : img
    ));

    // Note: Categories are stored locally for now
    // In production, you might want to store this in image_metadata table
  };

  const handleDelete = async (imageId: string, imageName: string) => {
    if (!confirm(`Are you sure you want to delete "${imageName}"?`)) return;

    // Find the image to get the actual filename in storage
    const image = images.find(img => img.id === imageId);
    if (image) {
      // Extract filename from URL
      const urlParts = image.url.split('/');
      const storageFileName = urlParts[urlParts.length - 1];

      await supabase.storage
        .from('images')
        .remove([storageFileName]);
    }

    setImages(images.filter(img => img.id !== imageId));
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Image URL copied to clipboard!");
  };

  const filteredImages = selectedCategory === "all"
    ? images
    : images.filter(img => img.category === selectedCategory);

  const categories = ["all", "hero", "events", "about", "team", "gallery", "other"];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Image Management</h1>
            <p className="text-gray-600 mt-2">Upload and manage website images</p>
          </div>
          <div>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <label htmlFor="file-upload">
              <span className="inline-flex items-center justify-center px-4 py-2 bg-[#22d3ee] hover:bg-[#22d3ee]/90 text-[#06121f] font-semibold rounded-lg cursor-pointer transition-colors disabled:opacity-50">
                {isUploading ? "Uploading..." : "+ Upload Images"}
              </span>
            </label>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Images are now stored in Supabase Storage. Upload images here to use them throughout your website.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Images</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{images.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#22d3ee]/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🖼️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hero Images</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {images.filter(i => i.category === "hero").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Event Images</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {images.filter(i => i.category === "events").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Other</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {images.filter(i => i.category === "other").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#22d3ee] text-[#06121f]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
              <p className="text-gray-500">No images found in this category.</p>
            </div>
          ) : (
            filteredImages.map((image) => (
              <div
                key={image.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
              >
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900 truncate" title={image.name}>
                      {image.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">{image.size}</p>
                      <p className="text-xs text-gray-500">{new Date(image.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <select
                    value={image.category}
                    onChange={(e) => handleCategoryChange(image.id, e.target.value as ImageFile["category"])}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none"
                  >
                    <option value="hero">Hero</option>
                    <option value="events">Events</option>
                    <option value="about">About</option>
                    <option value="team">Team</option>
                    <option value="gallery">Gallery</option>
                    <option value="other">Other</option>
                  </select>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCopyUrl(image.url)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
                    >
                      Copy URL
                    </Button>
                    <Button
                      onClick={() => handleDelete(image.id, image.name)}
                      className="bg-red-600 hover:bg-red-700 text-sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
