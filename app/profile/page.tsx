"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"] });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"] });

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
      <main className="min-h-screen bg-[#F3ECDD] flex items-center justify-center">
        <p className={`${plex.className} text-[#8A7A63] text-sm`}>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3ECDD] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => router.push("/")}
            className={`${plex.className} text-[#8A7A63] text-sm hover:text-[#5B1A1E] transition`}>
            ← Back
          </button>
          <h1 className={`${fraunces.className} text-[#2B211A] text-lg`}>My Profile</h1>
          <div className="w-16" />
        </div>

        {/* Profile card */}
        <div className="bg-[#EDE3CC] border border-[#D9CBA8] rounded-md p-6">

          {/* Email (read only) */}
          <div className="mb-4">
            <label className={`${plex.className} text-xs text-[#8A7A63] uppercase tracking-widest font-medium block mb-1`}>Email</label>
            <div className={`${plex.className} bg-[#F3ECDD] border border-[#D9CBA8] rounded-md px-4 py-3 text-[#8A7A63] text-sm`}>
              {profile.email}
            </div>
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <label className={`${plex.className} text-xs text-[#8A7A63] uppercase tracking-widest font-medium block mb-1`}>Full Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Enter your full name"
              className={`${plex.className} w-full bg-[#F3ECDD] border border-[#D9CBA8] text-[#2B211A] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#5B1A1E] placeholder-[#8A7A63]`}
            />
          </div>

          {/* Department */}
          <div className="mb-4">
            <label className={`${plex.className} text-xs text-[#8A7A63] uppercase tracking-widest font-medium block mb-1`}>Department</label>
            <select
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              className={`${plex.className} w-full bg-[#F3ECDD] border border-[#D9CBA8] text-[#2B211A] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#5B1A1E]`}>
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Supervisor */}
          <div className="mb-4">
            <label className={`${plex.className} text-xs text-[#8A7A63] uppercase tracking-widest font-medium block mb-1`}>Supervisor</label>
            <input
              type="text"
              value={profile.supervisor}
              onChange={(e) => setProfile({ ...profile, supervisor: e.target.value })}
              placeholder="Enter supervisor's name"
              className={`${plex.className} w-full bg-[#F3ECDD] border border-[#D9CBA8] text-[#2B211A] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#5B1A1E] placeholder-[#8A7A63]`}
            />
          </div>

          {/* Start Date */}
          <div className="mb-4">
            <label className={`${plex.className} text-xs text-[#8A7A63] uppercase tracking-widest font-medium block mb-1`}>SIWES Start Date</label>
            <input
              type="date"
              value={profile.start_date}
              onChange={(e) => setProfile({ ...profile, start_date: e.target.value })}
              className={`${plex.className} w-full bg-[#F3ECDD] border border-[#D9CBA8] text-[#2B211A] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#5B1A1E]`}
            />
          </div>

          {/* End Date */}
          <div className="mb-6">
            <label className={`${plex.className} text-xs text-[#8A7A63] uppercase tracking-widest font-medium block mb-1`}>SIWES End Date</label>
            <input
              type="date"
              value={profile.end_date}
              onChange={(e) => setProfile({ ...profile, end_date: e.target.value })}
              className={`${plex.className} w-full bg-[#F3ECDD] border border-[#D9CBA8] text-[#2B211A] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#5B1A1E]`}
            />
          </div>

          {message && (
            <p className={`${plex.className} text-sm mb-4 ${message.includes("Error") ? "text-[#5B1A1E]" : "text-[#3F6B4F]"}`}>
              {message}
            </p>
          )}

          <button onClick={handleSave} disabled={saving}
            className={`${plex.className} w-full bg-[#5B1A1E] text-[#F3ECDD] text-sm py-3 rounded-md hover:bg-[#4A1417] transition font-medium disabled:opacity-50`}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </main>
  );
}