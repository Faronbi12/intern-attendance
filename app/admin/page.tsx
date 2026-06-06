"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";

type AttendanceRecord = {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: "present" | "absent";
  reason?: string;
  email?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ present: 0, absent: 0, total: 0 });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      router.push("/");
      return;
    }
    fetchAllRecords();
  };

  const fetchAllRecords = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select("*, profiles(email)")
      .order("date", { ascending: false });

    if (!error && data) {
      const formatted = data.map((r: any) => ({
        ...r,
        email: r.profiles?.email || "Unknown",
      }));
      setRecords(formatted);
      const present = formatted.filter((r) => r.status === "present").length;
      const absent = formatted.filter((r) => r.status === "absent").length;
      setSummary({ present, absent, total: formatted.length });
    }
    setLoading(false);
  };
  const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push("/login");
};

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-100 overflow-hidden">

        {/* Navbar */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <span className="font-medium text-gray-800">👨‍💼 Admin Dashboard</span>
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition">
           Log out </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 px-6 pt-6 pb-4">
          <div className="flex flex-col items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-2xl font-semibold text-gray-900">{summary.total}</span>
            <span className="text-xs text-gray-400 mt-1">Total records</span>
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
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">All Intern Records</p>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
          ) : records.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">
              No records yet
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
                      <p className="text-xs text-blue-400 mb-1">{r.email}</p>
                      {r.status === "present" ? (
                        <p className="text-xs text-gray-400">
                          🟢 In: <strong>{r.check_in}</strong>
                          {r.check_out
                            ? <> · 🔵 Out: <strong>{r.check_out}</strong></>
                            : <span className="text-orange-400"> · Not checked out</span>}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">
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
