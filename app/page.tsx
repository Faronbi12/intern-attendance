"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useRouter } from "next/navigation";

type Record = {
  id?: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: "present" | "absent";
  reason?: string;
};

export default function Home() {
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);
  const [showAbsentForm, setShowAbsentForm] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const todayKey = new Date().toISOString().split("T")[0];
  const todayRecord = records.find((r) => r.date === todayKey);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
    } else {
      fetchRecords(user.id);
    }
  };

  const fetchRecords = async (userId: string) => {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (!error && data) setRecords(data);
    setLoading(false);
  };

  const getTime = () =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const handleCheckIn = async () => {
    if (todayRecord) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("attendance")
      .insert([{ date: todayKey, check_in: getTime(), check_out: null, status: "present", user_id: user.id }])
      .select();
    if (!error && data) setRecords([...data, ...records]);
  };

  const handleCheckOut = async () => {
    if (!todayRecord || todayRecord.check_out) return;
    const { error } = await supabase
      .from("attendance")
      .update({ check_out: getTime() })
      .eq("date", todayKey);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) fetchRecords(user.id);
    }
  };

  const handleAbsent = async () => {
    if (todayRecord) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("attendance")
      .insert([{ date: todayKey, check_in: null, check_out: null, status: "absent", reason, user_id: user.id }])
      .select();
    if (!error && data) setRecords([...data, ...records]);
    setShowAbsentForm(false);
    setReason("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 overflow-hidden">

        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <span className="font-medium text-gray-800">📋 Intern Attendance</span>
          <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-600 transition">Log out</button>
        </div>

        <div className="px-6 pt-8 pb-6">
          <p className="text-sm text-gray-400 mb-1">Good morning,</p>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back 👋</h1>
          <p className="text-sm text-gray-400 mb-5">Track your attendance for today.</p>

          <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 mb-6 inline-block">
            📅 {today}
          </div>

          {todayRecord && (
            <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600">
              {todayRecord.status === "present" ? (
                <p>✅ Checked in at <strong>{todayRecord.check_in}</strong>
                  {todayRecord.check_out && <> · Checked out at <strong>{todayRecord.check_out}</strong></>}
                </p>
              ) : (
                <p>❌ Marked absent {todayRecord.reason && <>— <em>{todayRecord.reason}</em></>}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleCheckIn} disabled={!!todayRecord}
              className="flex flex-col gap-2 p-4 rounded-xl border border-green-200 bg-green-50 text-left hover:bg-green-100 transition disabled:opacity-40 disabled:cursor-not-allowed">
              <span className="text-xl">🟢</span>
              <span className="font-medium text-green-900 text-sm">Check in</span>
              <span className="text-xs text-gray-400">Mark your arrival</span>
            </button>
            <button onClick={handleCheckOut} disabled={!todayRecord || todayRecord.status === "absent" || !!todayRecord.check_out}
              className="flex flex-col gap-2 p-4 rounded-xl border border-blue-200 bg-blue-50 text-left hover:bg-blue-100 transition disabled:opacity-40 disabled:cursor-not-allowed">
              <span className="text-xl">🔵</span>
              <span className="font-medium text-blue-900 text-sm">Check out</span>
              <span className="text-xs text-gray-400">Mark your departure</span>
            </button>
            <button onClick={() => setShowAbsentForm(true)} disabled={!!todayRecord}
              className="col-span-2 flex flex-col gap-2 p-4 rounded-xl border border-orange-200 bg-orange-50 text-left hover:bg-orange-100 transition disabled:opacity-40 disabled:cursor-not-allowed">
              <span className="text-xl">🔴</span>
              <span className="font-medium text-orange-900 text-sm">Mark absent</span>
              <span className="text-xs text-gray-400">Record absence with reason</span>
            </button>
          </div>

          {showAbsentForm && (
            <div className="mt-4 p-4 rounded-xl border border-orange-200 bg-orange-50">
              <p className="text-sm font-medium text-orange-900 mb-2">Reason for absence</p>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Sick, family emergency..."
                className="w-full text-sm border border-orange-200 rounded-lg p-2 mb-3 resize-none bg-white" rows={3} />
              <div className="flex gap-2">
                <button onClick={handleAbsent} className="flex-1 bg-orange-500 text-white text-sm py-2 rounded-lg hover:bg-orange-600 transition">Submit</button>
                <button onClick={() => setShowAbsentForm(false)} className="flex-1 border border-gray-200 text-sm py-2 rounded-lg hover:bg-gray-100 transition">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Recent history</p>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
          ) : records.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">
              Attendance history will appear here
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {records.map((r) => (
                <div key={r.id} className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">{new Date(r.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
                    <p className="text-xs text-gray-400">
                      {r.status === "present" ? `${r.check_in}${r.check_out ? " → " + r.check_out : " (not checked out)"}` : r.reason || "No reason given"}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${r.status === "present" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                    {r.status === "present" ? "Present" : "Absent"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}