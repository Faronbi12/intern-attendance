"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useRouter } from "next/navigation";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"] });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"] });

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
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const todayKey = new Date().toISOString().split("T")[0];
  const todayRecord = records.find((r) => r.date === todayKey);

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/landing"); return; }
    setUserEmail(user.email || "");
    setAuthLoading(false);
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

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#F3ECDD] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#5B1A1E] flex items-center justify-center mx-auto mb-4">
            <span className={`${fraunces.className} text-[#F3ECDD] text-base`}>IA</span>
          </div>
          <p className={`${plex.className} text-[#8A7A63] text-sm`}>Loading your record...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3ECDD] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`${fraunces.className} text-[#2B211A] text-xl`}>Intern Attendance</h1>
            <p className={`${plex.className} text-[#8A7A63] text-xs mt-0.5`}>{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className={`${plex.className} text-xs border border-[#5B1A1E] text-[#5B1A1E] px-3 py-1.5 rounded-md hover:bg-[#5B1A1E] hover:text-[#F3ECDD] transition`}
          >
            Log out
          </button>
        </div>

        <div className="relative bg-[#EDE3CC] border border-[#D9CBA8] rounded-md px-6 py-5 mb-4 overflow-hidden">
          <span className="absolute left-0 top-0 h-full w-1 bg-[#5B1A1E]" />
          <p className={`${plex.className} text-[#8A7A63] text-xs mb-1`}>Today</p>
          <p className={`${fraunces.className} text-[#2B211A] text-lg`}>{today}</p>
          {todayRecord ? (
            <div className="mt-3 pt-3 border-t border-[#D9CBA8]">
              {todayRecord.status === "present" ? (
                <p className={`${plex.className} text-sm text-[#3F6B4F]`}>
                  Checked in at <strong>{todayRecord.check_in}</strong>
                  {todayRecord.check_out && <> · Checked out at <strong>{todayRecord.check_out}</strong></>}
                </p>
              ) : (
                <p className={`${plex.className} text-sm text-[#5B1A1E]`}>
                  Absent{todayRecord.reason && <> — {todayRecord.reason}</>}
                </p>
              )}
            </div>
          ) : (
            <p className={`${plex.className} text-[#8A7A63] text-sm mt-2`}>No record yet for today.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={handleCheckIn}
            disabled={!!todayRecord}
            className="flex flex-col gap-2 p-4 rounded-md bg-[#EDE3CC] border border-[#D9CBA8] text-left hover:border-[#3F6B4F] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F6B4F" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={`${plex.className} font-medium text-[#2B211A] text-sm`}>Check In</span>
            <span className={`${plex.className} text-xs text-[#8A7A63]`}>Mark your arrival</span>
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!todayRecord || todayRecord.status === "absent" || !!todayRecord.check_out}
            className="flex flex-col gap-2 p-4 rounded-md bg-[#EDE3CC] border border-[#D9CBA8] text-left hover:border-[#2B211A] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B211A" strokeWidth="1.5">
              <path d="M4 12h13M13 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={`${plex.className} font-medium text-[#2B211A] text-sm`}>Check Out</span>
            <span className={`${plex.className} text-xs text-[#8A7A63]`}>Mark your departure</span>
          </button>
        </div>

        <button
          onClick={() => setShowAbsentForm(true)}
          disabled={!!todayRecord}
          className="w-full flex items-center gap-3 p-4 rounded-md bg-[#EDE3CC] border border-[#D9CBA8] text-left hover:border-[#5B1A1E] transition disabled:opacity-40 disabled:cursor-not-allowed mb-4"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B1A1E" strokeWidth="1.5" className="shrink-0">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" />
          </svg>
          <div>
            <p className={`${plex.className} font-medium text-[#2B211A] text-sm`}>Mark Absent</p>
            <p className={`${plex.className} text-xs text-[#8A7A63]`}>Record absence with reason</p>
          </div>
        </button>

        {showAbsentForm && (
          <div className="bg-[#EDE3CC] border border-[#D9CBA8] rounded-md p-4 mb-4">
            <p className={`${plex.className} text-[#2B211A] font-medium text-sm mb-3`}>Reason for absence</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Sick, family emergency..."
              className={`${plex.className} w-full text-sm bg-[#F3ECDD] border border-[#D9CBA8] text-[#2B211A] rounded-md p-3 mb-3 resize-none placeholder-[#8A7A63] focus:outline-none focus:border-[#5B1A1E]`}
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAbsent}
                className={`${plex.className} flex-1 bg-[#5B1A1E] text-[#F3ECDD] text-sm py-2 rounded-md hover:bg-[#4A1417] transition font-medium`}
              >
                Submit
              </button>
              <button
                onClick={() => setShowAbsentForm(false)}
                className={`${plex.className} flex-1 border border-[#D9CBA8] text-[#8A7A63] text-sm py-2 rounded-md hover:bg-[#F3ECDD] transition`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#EDE3CC] border border-[#D9CBA8] rounded-md p-4">
          <div className="flex justify-between items-center mb-2">
            <p className={`${plex.className} text-xs text-[#8A7A63]`}>Recent history</p>
            <button
              onClick={() => router.push("/history")}
              className={`${plex.className} text-xs text-[#5B1A1E] hover:text-[#4A1417] transition`}
            >
              View all
            </button>
          </div>
          {loading ? (
            <p className={`${plex.className} text-sm text-[#8A7A63] text-center py-4`}>Loading...</p>
          ) : records.length === 0 ? (
            <p className={`${plex.className} text-sm text-[#8A7A63] text-center py-4 border border-dashed border-[#D9CBA8] rounded-md`}>
              No records yet
            </p>
          ) : (
            <div className="flex flex-col">
              {records.slice(0, 5).map((r) => (
                <div key={r.id} className="flex justify-between items-center py-2.5 border-b border-[#D9CBA8] last:border-0">
                  <div>
                    <p className={`${plex.className} text-[#2B211A] text-sm font-medium`}>
                      {new Date(r.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    <p className={`${plex.className} text-xs text-[#8A7A63]`}>
                      {r.status === "present"
                        ? `${r.check_in}${r.check_out ? " → " + r.check_out : " (not checked out)"}`
                        : r.reason || "No reason given"}
                    </p>
                  </div>
                  <span
                    className={`${plex.className} text-xs px-2 py-1 rounded-full font-medium ${
                      r.status === "present" ? "bg-[#DCE7DE] text-[#3F6B4F]" : "bg-[#EAD8D8] text-[#5B1A1E]"
                    }`}
                  >
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