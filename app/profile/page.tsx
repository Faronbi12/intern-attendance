"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";

const departments = [
  "VAS & Infrastructure",
  "Technical",
  "Audit",
  "Business Intelligence Unit",
  "Accounts",
  "HR & Admin",
  "Project Management",
];

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState({
    full_name: "",
    department: "",
    supervisor: "",
    start_date: "",
    end_date: "",
    email: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/landing"); return; }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        department: data.department || "",
        supervisor: data.supervisor || "",
        start_date: data.start_date || "",
        end_date: data.end_date || "",
        email: user.email || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        department: profile.department,
        supervisor: profile.supervisor,
        start_date: profile.start_date,
        end_date: profile.end_date,
      })
      .eq("id", user.id);

    if (error) setMessage("Error saving profile.");
    else setMessage("Profile saved successfully!");
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => router.push("/")}
            className="text-slate-400 text-sm hover:text-white transition">
            ← Back
          </button>
          <h1 className="text-white font-bold text-lg">My Profile</h1>
          <div className="w-16" />
        </div>

        {/* Profile card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">

          {/* Email (read only) */}
          <div className="mb-4">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-medium block mb-1">Email</label>
            <div className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-400 text-sm">
              {profile.email}
            </div>
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-medium block mb-1">Full Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>

          {/* Department */}
          <div className="mb-4">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-medium block mb-1">Department</label>
            <select
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Supervisor */}
          <div className="mb-4">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-medium block mb-1">Supervisor</label>
            <input
              type="text"
              value={profile.supervisor}
              onChange={(e) => setProfile({ ...profile, supervisor: e.target.value })}
              placeholder="Enter supervisor's name"
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>

          {/* Start Date */}
          <div className="mb-4">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-medium block mb-1">SIWES Start Date</label>
            <input
              type="date"
              value={profile.start_date}
              onChange={(e) => setProfile({ ...profile, start_date: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* End Date */}
          <div className="mb-6">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-medium block mb-1">SIWES End Date</label>
            <input
              type="date"
              value={profile.end_date}
              onChange={(e) => setProfile({ ...profile, end_date: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {message && (
            <p className={`text-sm mb-4 ${message.includes("Error") ? "text-red-400" : "text-green-400"}`}>
              {message}
            </p>
          )}

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-blue-600 text-white text-sm py-3 rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </main>
  );
}