// Supabase client configuration
// This file is ready for Supabase integration

import { createClient } from '@supabase/supabase-js';

// Environment variables (add these to your .env.local file)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

// Create Supabase client
// Use safe fallbacks so the app can boot without env configured.
// Calls will fail at runtime if Supabase isn't configured.
export const supabase = createClient(
  supabaseUrl ?? 'http://localhost:54321',
  supabaseAnonKey ?? 'anon-key'
);

if (!supabaseEnabled && process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Supabase features are disabled until you set .env.local.'
  );
}

// Database Types (update these based on your Supabase schema)
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image?: string;
  spots: number;
  deadline: string;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ImageMetadata {
  id: string;
  name: string;
  url: string;
  category: 'hero' | 'events' | 'about' | 'team' | 'gallery' | 'other';
  size: number;
  created_at: string;
}

// Helper functions for common operations

// Auth helpers
export const authHelpers = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },
};

// Profile helpers
export const profileHelpers = {
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  updateRole: async (userId: string, role: 'admin' | 'user') => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    return { data, error };
  },

  getAllProfiles: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },
};

// Event helpers
export const eventHelpers = {
  getAllEvents: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    return { data, error };
  },

  getEventById: async (eventId: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    return { data, error };
  },

  createEvent: async (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();
    return { data, error };
  },

  updateEvent: async (eventId: string, updates: Partial<Event>) => {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();
    return { data, error };
  },

  deleteEvent: async (eventId: string) => {
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    return { data, error };
  },
};

// Image storage helpers
export const imageHelpers = {
  uploadImage: async (file: File, path?: string) => {
    const filePath = path || `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (error) return { data: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return { data: { path: filePath, url: publicUrl }, error: null };
  },

  deleteImage: async (path: string) => {
    const { data, error } = await supabase.storage
      .from('images')
      .remove([path]);
    return { data, error };
  },

  listImages: async () => {
    const { data, error } = await supabase.storage
      .from('images')
      .list();
    return { data, error };
  },

  getPublicUrl: (path: string) => {
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(path);
    return data.publicUrl;
  },
};
