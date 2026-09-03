"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"] });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"] });

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
  const [authLoading, setAuthLoading] = useState(true);
  const [summary, setSummary] = useState({ present: 0, absent: 0, total: 0 });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/landing"); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      router.push("/");
      return;
    }
    setAuthLoading(false);
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
    router.push("/landing");
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#F3ECDD] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#5B1A1E] flex items-center justify-center mx-auto mb-4">
            <span className={`${fraunces.className} text-[#F3ECDD] text-base`}>IA</span>
          </div>
          <p className={`${plex.className} text-[#8A7A63] text-sm`}>Loading records...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3ECDD] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl bg-[#EDE3CC] border border-[#D9CBA8] rounded-md overflow-hidden">

        {/* Navbar */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#D9CBA8]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#5B1A1E] flex items-center justify-center shrink-0 text-[#5B1A1E]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
              </svg>
            </div>
            <span className={`${fraunces.className} text-[#2B211A] text-base`}>Admin Dashboard</span>
          </div>
          <button onClick={handleLogout}
            className={`${plex.className} text-xs border border-[#5B1A1E] text-[#5B1A1E] px-3 py-1.5 rounded-md hover:bg-[#5B1A1E] hover:text-[#F3ECDD] transition`}>
            Log out
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 px-6 pt-6 pb-4">
          <div className="flex flex-col items-center p-3 rounded-md bg-[#F3ECDD] border border-[#D9CBA8]">
            <span className={`${fraunces.className} text-2xl text-[#2B211A]`}>{summary.total}</span>
            <span className={`${plex.className} text-xs text-[#8A7A63] mt-1`}>Total records</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-md bg-[#F3ECDD] border border-[#D9CBA8]">
            <span className={`${fraunces.className} text-2xl text-[#3F6B4F]`}>{summary.present}</span>
            <span className={`${plex.className} text-xs text-[#8A7A63] mt-1`}>Present</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-md bg-[#F3ECDD] border border-[#D9CBA8]">
            <span className={`${fraunces.className} text-2xl text-[#5B1A1E]`}>{summary.absent}</span>
            <span className={`${plex.className} text-xs text-[#8A7A63] mt-1`}>Absent</span>
          </div>
        </div>

        {/* Records */}
        <div className="px-6 pb-8">
          <p className={`${plex.className} text-xs text-[#8A7A63] mb-3`}>All intern records</p>
          {loading ? (
            <p className={`${plex.className} text-sm text-[#8A7A63] text-center py-4`}>Loading...</p>
          ) : records.length === 0 ? (
            <div className={`${plex.className} text-sm text-[#8A7A63] text-center py-4 border border-dashed border-[#D9CBA8] rounded-md`}>
              No records yet
            </div>
          ) : (
            <div className="flex flex-col">
              {records.map((r) => (
                <div key={r.id} className="py-3 border-b border-[#D9CBA8] last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`${plex.className} font-medium text-[#2B211A] text-sm`}>
                        {new Date(r.date).toLocaleDateString("en-US", {
                          weekday: "long", month: "long", day: "numeric", year: "numeric"
                        })}
                      </p>
                      <p className={`${plex.className} text-xs text-[#8A7A63] mb-1`}>{r.email}</p>
                      {r.status === "present" ? (
                        <p className={`${plex.className} text-xs text-[#3F6B4F]`}>
                          In: <strong>{r.check_in}</strong>
                          {r.check_out
                            ? <> · Out: <strong>{r.check_out}</strong></>
                            : <span> · Not checked out</span>}
                        </p>
                      ) : (
                        <p className={`${plex.className} text-xs text-[#5B1A1E]`}>
                          Absent {r.reason && <>— <em>{r.reason}</em></>}
                        </p>
                      )}
                    </div>
                    <span className={`${plex.className} text-xs px-2 py-1 rounded-full font-medium ${
                      r.status === "present" ? "bg-[#DCE7DE] text-[#3F6B4F]" : "bg-[#EAD8D8] text-[#5B1A1E]"
                    }`}>
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