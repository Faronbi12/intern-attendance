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
  const [userEmail, setUserEmail] = useState("");

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
    if (!user) { router.push("/landing"); return; }
    setUserEmail(user.email || "");
    fetchRecords(user.id);
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
    router.push("/landing");
  };

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">Intern Attendance</h1>
            <p className="text-slate-400 text-xs mt-0.5">{userEmail}</p>
          </div>
          <button onClick={handleLogout}
            className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition">
            Log out
          </button>
        </div>

        {/* Date card */}
        <div className="bg-blue-600 rounded-2xl px-6 py-5 mb-4">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-widest mb-1">Today</p>
          <p className="text-white font-semibold text-lg">{today}</p>
          {todayRecord ? (
            <div className="mt-3 pt-3 border-t border-blue-500">
              {todayRecord.status === "present" ? (
                <p className="text-blue-100 text-sm">
                  ✅ Checked in at <strong>{todayRecord.check_in}</strong>
                  {todayRecord.check_out && <> · Checked out at <strong>{todayRecord.check_out}</strong></>}
                </p>
              ) : (
                <p className="text-blue-100 text-sm">❌ Absent {todayRecord.reason && <>— {todayRecord.reason}</>}</p>
              )}
            </div>
          ) : (
            <p className="text-blue-200 text-sm mt-2">No record yet for today.</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={handleCheckIn} disabled={!!todayRecord}
            className="flex flex-col gap-2 p-4 rounded-xl bg-slate-800 border border-slate-700 text-left hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
            <span className="text-2xl">🟢</span>
            <span className="font-semibold text-white text-sm">Check In</span>
            <span className="text-xs text-slate-400">Mark your arrival</span>
          </button>
          <button onClick={handleCheckOut} disabled={!todayRecord || todayRecord.status === "absent" || !!todayRecord.check_out}
            className="flex flex-col gap-2 p-4 rounded-xl bg-slate-800 border border-slate-700 text-left hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
            <span className="text-2xl">🔵</span>
            <span className="font-semibold text-white text-sm">Check Out</span>
            <span className="text-xs text-slate-400">Mark your departure</span>
          </button>
        </div>

        <button onClick={() => setShowAbsentForm(true)} disabled={!!todayRecord}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-800 border border-slate-700 text-left hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed mb-4">
          <span className="text-2xl">🔴</span>
          <div>
            <p className="font-semibold text-white text-sm">Mark Absent</p>
            <p className="text-xs text-slate-400">Record absence with reason</p>
          </div>
        </button>

        {/* Absent form */}
        {showAbsentForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4">
            <p className="text-white font-medium text-sm mb-3">Reason for absence</p>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Sick, family emergency..."
              className="w-full text-sm bg-slate-900 border border-slate-600 text-white rounded-lg p-3 mb-3 resize-none placeholder-slate-500 focus:outline-none focus:border-blue-500"
              rows={3} />
            <div className="flex gap-2">
              <button onClick={handleAbsent}
                className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                Submit
              </button>
              <button onClick={() => setShowAbsentForm(false)}
                className="flex-1 border border-slate-600 text-slate-300 text-sm py-2 rounded-lg hover:bg-slate-700 transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* History */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recent History</p>
            <button onClick={() => router.push("/history")}
              className="text-xs text-blue-400 hover:text-blue-300 transition">View all →</button>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4 border border-dashed border-slate-700 rounded-lg">
              No records yet
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {records.slice(0, 5).map((r) => (
                <div key={r.id} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">
                      {new Date(r.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-slate-400">
                      {r.status === "present"
                        ? `${r.check_in}${r.check_out ? " → " + r.check_out : " (not checked out)"}`
                        : r.reason || "No reason given"}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.status === "present" ? "bg-blue-900 text-blue-300" : "bg-red-900 text-red-300"}`}>
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