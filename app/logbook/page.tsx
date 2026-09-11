"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";

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
    if (!form.activity || !form.learned) {
      setMessage("Please fill in both fields.");
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
    <main className="min-h-screen bg-slate-900 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => router.push("/")}
            className="text-slate-400 text-sm hover:text-white transition">
            ← Back
          </button>
          <h1 className="text-white font-bold text-lg">Daily Logbook</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
            + New Entry
          </button>
        </div>

        {/* New entry form */}
        {showForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-4">
            <p className="text-white font-medium text-sm mb-4">New Logbook Entry</p>

            <div className="mb-3">
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Date</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>

            <div className="mb-4">
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Daily Activity</label>
              <textarea value={form.activity}
                onChange={(e) => setForm({ ...form, activity: e.target.value })}
                placeholder="What did you work on and what did you learn today?..."
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500 resize-none"
                rows={5} />
            </div>

            {message && (
              <p className={`text-sm mb-3 ${message.includes("Error") || message.includes("Please") ? "text-red-400" : "text-green-400"}`}>
                {message}
              </p>
            )}

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-blue-600 text-white text-sm py-2.5 rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50">
                {saving ? "Saving..." : "Save Entry"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="flex-1 border border-slate-600 text-slate-300 text-sm py-2.5 rounded-xl hover:bg-slate-700 transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Entries list */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <p className="text-slate-400 text-sm text-center py-8">Loading...</p>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm mb-2">No logbook entries yet</p>
              <p className="text-slate-600 text-xs">Click "+ New Entry" to add your first entry</p>
            </div>
          ) : (
            activities.map((a) => (
              <div key={a.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <p className="text-blue-400 text-xs font-medium mb-3">
                  {new Date(a.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
                <div className="mb-3">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Daily Activity</p>
                  <p className="text-white text-sm leading-relaxed">{a.activity}</p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}
