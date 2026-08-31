"use client";
import { useRouter } from "next/navigation";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"] });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"] });

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F3ECDD] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Mark */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-[#5B1A1E] flex items-center justify-center mb-5">
            <span className={`${fraunces.className} text-[#F3ECDD] text-lg`}>IA</span>
          </div>
          <h1 className={`${fraunces.className} text-[#2B211A] text-3xl`}>
            Intern Attendance
          </h1>
          <p className={`${plex.className} text-[#8A7A63] text-sm mt-2`}>
            Choose a portal to sign in
          </p>
        </div>

        {/* Ledger rows */}
        <div className="border-t border-[#D9CBA8]">
          <button
            onClick={() => router.push("/intern-login")}
            className="relative w-full flex items-center gap-4 py-5 pl-3 pr-1 border-b border-[#D9CBA8] text-left group transition-colors hover:bg-[#EDE3CC]"
          >
            <span className="absolute left-0 top-0 h-full w-0 group-hover:w-1 bg-[#5B1A1E] transition-all duration-200" />
            <div className="w-10 h-10 rounded-full border border-[#5B1A1E] flex items-center justify-center shrink-0 text-[#5B1A1E]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1">
              <p className={`${plex.className} text-[#2B211A] font-medium`}>Intern Portal</p>
              <p className={`${plex.className} text-[#8A7A63] text-sm mt-0.5`}>
                Check in, check out, and view your attendance
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A7A63" strokeWidth="1.5" className="shrink-0">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={() => router.push("/admin-login")}
            className="relative w-full flex items-center gap-4 py-5 pl-3 pr-1 text-left group transition-colors hover:bg-[#EDE3CC]"
          >
            <span className="absolute left-0 top-0 h-full w-0 group-hover:w-1 bg-[#5B1A1E] transition-all duration-200" />
            <div className="w-10 h-10 rounded-full border border-[#5B1A1E] flex items-center justify-center shrink-0 text-[#5B1A1E]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1">
              <p className={`${plex.className} text-[#2B211A] font-medium`}>Admin Portal</p>
              <p className={`${plex.className} text-[#8A7A63] text-sm mt-0.5`}>
                Monitor attendance and manage intern records
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A7A63" strokeWidth="1.5" className="shrink-0">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <p className={`${plex.className} text-center text-[#8A7A63] text-xs mt-10`}>
          Intern Attendance System, 2026
        </p>
      </div>
    </main>
  );
}