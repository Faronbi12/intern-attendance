"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"] });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"] });

type Activity = {
  id: string;
  date: string;
  activity: string;
  learned: string;
};

export default function LogbookPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    activity: "",
    learned: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/landing"); return; }
    fetchActivities(user.id);
  };

  const fetchActivities = async (userId: string) => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (!error && data) setActivities(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.activity) {
      setMessage("Please fill in the activity field.");
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("activities")
      .insert([{ ...form, user_id: user.id }]);

    if (error) setMessage("Error saving entry.");
    else {
      setMessage("Entry saved!");
      setForm({ date: new Date().toISOString().split("T")[0], activity: "", learned: "" });
      setShowForm(false);
      fetchActivities(user.id);
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <main className="min-h-screen bg-[#F3ECDD] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => router.push("/")}
            className={`${plex.className} text-[#8A7A63] text-sm hover:text-[#5B1A1E] transition`}>
            ← Back
          </button>
          <h1 className={`${fraunces.className} text-[#2B211A] text-lg`}>Daily Logbook</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`${plex.className} text-xs border border-[#5B1A1E] text-[#5B1A1E] px-3 py-1.5 rounded-md hover:bg-[#5B1A1E] hover:text-[#F3ECDD] transition`}>
            + New Entry
          </button>
        </div>

        {/* New entry form */}
        {showForm && (
          <div className="bg-[#EDE3CC] border border-[#D9CBA8] rounded-md p-5 mb-4">
            <p className={`${plex.className} text-[#2B211A] font-medium text-sm mb-4`}>New Logbook Entry</p>

            <div className="mb-3">
              <label className={`${plex.className} text-xs text-[#8A7A63] uppercase tracking-widest block mb-1`}>Date</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={`${plex.className} w-full bg-[#F3ECDD] border border-[#D9CBA8] text-[#2B211A] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#5B1A1E]`} />
            </div>

            <div className="mb-4">
              <label className={`${plex.className} text-xs text-[#8A7A63] uppercase tracking-widest block mb-1`}>Daily Activity</label>
              <textarea value={form.activity}
                onChange={(e) => setForm({ ...form, activity: e.target.value })}
                placeholder="What did you work on and what did you learn today?..."
                className={`${plex.className} w-full bg-[#F3ECDD] border border-[#D9CBA8] text-[#2B211A] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#5B1A1E] placeholder-[#8A7A63] resize-none`}
                rows={5} />
            </div>

            {message && (
              <p className={`${plex.className} text-sm mb-3 ${message.includes("Error") || message.includes("Please") ? "text-[#5B1A1E]" : "text-[#3F6B4F]"}`}>
                {message}
              </p>
            )}

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className={`${plex.className} flex-1 bg-[#5B1A1E] text-[#F3ECDD] text-sm py-2.5 rounded-md hover:bg-[#4A1417] transition font-medium disabled:opacity-50`}>
                {saving ? "Saving..." : "Save Entry"}
              </button>
              <button onClick={() => setShowForm(false)}
                className={`${plex.className} flex-1 border border-[#D9CBA8] text-[#8A7A63] text-sm py-2.5 rounded-md hover:bg-[#F3ECDD] transition`}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Entries list */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <p className={`${plex.className} text-[#8A7A63] text-sm text-center py-8`}>Loading...</p>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <p className={`${plex.className} text-[#8A7A63] text-sm mb-2`}>No logbook entries yet</p>
              <p className={`${plex.className} text-[#B5A585] text-xs`}>Click "+ New Entry" to add your first entry</p>
            </div>
          ) : (
            activities.map((a) => (
              <div key={a.id} className="bg-[#EDE3CC] border border-[#D9CBA8] rounded-md p-5">
                <p className={`${plex.className} text-[#5B1A1E] text-xs font-medium mb-3`}>
                  {new Date(a.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
                <div>
                  <p className={`${plex.className} text-xs text-[#8A7A63] uppercase tracking-widest mb-1`}>Daily Activity</p>
                  <p className={`${plex.className} text-[#2B211A] text-sm leading-relaxed`}>{a.activity}</p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}
