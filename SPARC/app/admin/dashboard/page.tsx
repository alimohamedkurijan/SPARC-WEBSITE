"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    activeEvents: 0,
    pendingRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchStats = async () => {
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

      // Fetch stats from Supabase
      const { data: events } = await supabase.from('events').select('*');
      const { data: users } = await supabase.from('profiles').select('*');

      const today = new Date().toISOString().split('T')[0];
      const activeEventsCount = events?.filter((e: { date: string }) => e.date >= today).length || 0;

      setStats({
        totalEvents: events?.length || 0,
        totalUsers: users?.length || 0,
        activeEvents: activeEventsCount,
        pendingRegistrations: 0,
      });
      setLoading(false);
    };

    checkAuthAndFetchStats();
  }, [router]);

  const quickActions = [
    {
      title: "Add New Event",
      description: "Create a new event for the club",
      icon: "📅",
      action: () => router.push("/admin/events/new"),
      color: "bg-[#CF8420]",
    },
    {
      title: "Manage Users",
      description: "Assign admin roles and manage users",
      icon: "👥",
      action: () => router.push("/admin/users"),
      color: "bg-[#C02026]",
    },
    {
      title: "Update Images",
      description: "Upload and manage website images",
      icon: "🖼️",
      action: () => router.push("/admin/images"),
      color: "bg-blue-600",
    },
    {
      title: "View Events",
      description: "Edit or delete existing events",
      icon: "📋",
      action: () => router.push("/admin/events"),
      color: "bg-green-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to SPARC Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEvents}</p>
              </div>
              <div className="w-12 h-12 bg-[#CF8420]/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeEvents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-[#C02026]/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingRegistrations}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all text-left group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{action.icon}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
