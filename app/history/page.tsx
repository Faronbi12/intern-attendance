"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";

type Record = {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: "present" | "absent";
  reason?: string;
};

export default function HistoryPage() {
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ present: 0, absent: 0, total: 0 });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push("/login");
    else fetchRecords(user.id);
  };

  const fetchRecords = async (userId: string) => {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (!error && data) {
      setRecords(data);
      const present = data.filter((r) => r.status === "present").length;
      const absent = data.filter((r) => r.status === "absent").length;
      setSummary({ present, absent, total: data.length });
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 overflow-hidden">

        {/* Navbar */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <button onClick={() => router.push("/")} className="text-sm text-gray-400 hover:text-gray-600 transition">
            ← Back
          </button>
          <span className="font-medium text-gray-800">Attendance History</span>
          <div className="w-12" />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 px-6 pt-6 pb-4">
          <div className="flex flex-col items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-2xl font-semibold text-gray-900">{summary.total}</span>
            <span className="text-xs text-gray-400 mt-1">Total days</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-green-50 border border-green-100">
            <span className="text-2xl font-semibold text-green-700">{summary.present}</span>
            <span className="text-xs text-gray-400 mt-1">Present</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-orange-50 border border-orange-100">
            <span className="text-2xl font-semibold text-orange-700">{summary.absent}</span>
            <span className="text-xs text-gray-400 mt-1">Absent</span>
          </div>
        </div>

        {/* Records */}
        <div className="px-6 pb-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">All Records</p>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
          ) : records.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">
              No attendance records yet
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {records.map((r) => (
                <div key={r.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {new Date(r.date).toLocaleDateString("en-US", {
                          weekday: "long", month: "long", day: "numeric", year: "numeric"
                        })}
                      </p>
                      {r.status === "present" ? (
                        <p className="text-xs text-gray-400 mt-1">
                          🟢 In: <strong>{r.check_in}</strong>
                          {r.check_out
                            ? <> · 🔵 Out: <strong>{r.check_out}</strong></>
                            : <span className="text-orange-400"> · Not checked out</span>}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1">
                          🔴 Absent {r.reason && <>— <em>{r.reason}</em></>}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${r.status === "present" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                      {r.status === "present" ? "Present" : "Absent"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
} 
