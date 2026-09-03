"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"] });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"] });

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
  const [authLoading, setAuthLoading] = useState(true);
  const [summary, setSummary] = useState({ present: 0, absent: 0, total: 0 });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/landing"); return; }
    setAuthLoading(false);
    fetchRecords(user.id);
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

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#F3ECDD] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#5B1A1E] flex items-center justify-center mx-auto mb-4">
            <span className={`${fraunces.className} text-[#F3ECDD] text-base`}>IA</span>
          </div>
          <p className={`${plex.className} text-[#8A7A63] text-sm`}>Loading history...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3ECDD] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md bg-[#EDE3CC] border border-[#D9CBA8] rounded-md overflow-hidden">

        {/* Navbar */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#D9CBA8]">
          <button onClick={() => router.push("/")}
            className={`${plex.className} flex items-center gap-1.5 text-sm text-[#8A7A63] hover:text-[#5B1A1E] transition`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <span className={`${fraunces.className} text-[#2B211A] text-base`}>Attendance History</span>
          <div className="w-12" />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 px-6 pt-6 pb-4">
          <div className="flex flex-col items-center p-3 rounded-md bg-[#F3ECDD] border border-[#D9CBA8]">
            <span className={`${fraunces.className} text-2xl text-[#2B211A]`}>{summary.total}</span>
            <span className={`${plex.className} text-xs text-[#8A7A63] mt-1`}>Total days</span>
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
          <p className={`${plex.className} text-xs text-[#8A7A63] mb-3`}>All records</p>
          {loading ? (
            <p className={`${plex.className} text-sm text-[#8A7A63] text-center py-4`}>Loading...</p>
          ) : records.length === 0 ? (
            <div className={`${plex.className} text-sm text-[#8A7A63] text-center py-4 border border-dashed border-[#D9CBA8] rounded-md`}>
              No attendance records yet
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
                      {r.status === "present" ? (
                        <p className={`${plex.className} text-xs text-[#3F6B4F] mt-1`}>
                          In: <strong>{r.check_in}</strong>
                          {r.check_out
                            ? <> · Out: <strong>{r.check_out}</strong></>
                            : <span> · Not checked out</span>}
                        </p>
                      ) : (
                        <p className={`${plex.className} text-xs text-[#5B1A1E] mt-1`}>
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