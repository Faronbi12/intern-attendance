"use client";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"] });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"] });

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        if (error.message.includes("Password")) {
          setError("Password must be at least 12 characters long and contain uppercase and lowercase letters, a number, and a special character.");
        } else {
          setError(error.message);
        }
      }
      else setError("Check your email to confirm. Ask your system admin to grant you admin access.");
    } else {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        setError("You do not have admin access.");
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#F3ECDD] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        <button onClick={() => router.push("/landing")}
          className={`${plex.className} flex items-center gap-1.5 text-[#8A7A63] text-sm mb-6 hover:text-[#5B1A1E] transition`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        <div className="bg-[#EDE3CC] border border-[#D9CBA8] rounded-md px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full border border-[#5B1A1E] flex items-center justify-center shrink-0 text-[#5B1A1E]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className={`${fraunces.className} text-[#2B211A] text-lg`}>
                {isSignUp ? "Create admin account" : "Admin login"}
              </h1>
              <p className={`${plex.className} text-[#8A7A63] text-xs`}>Restricted — authorized personnel only</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className={`${plex.className} text-xs text-[#8A7A63]`}>Admin email</label>
              <input type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${plex.className} w-full text-sm bg-transparent border-b border-[#B8A97E] text-[#2B211A] py-2 focus:outline-none focus:border-[#5B1A1E] transition-colors`} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={`${plex.className} text-xs text-[#8A7A63]`}>Password</label>
              <input type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${plex.className} w-full text-sm bg-transparent border-b border-[#B8A97E] text-[#2B211A] py-2 focus:outline-none focus:border-[#5B1A1E] transition-colors`} />
            </div>

            {error && (
              <p className={`${plex.className} text-sm ${error.includes("Check your email") ? "text-[#3F6B4F]" : "text-[#5B1A1E]"}`}>
                {error}
              </p>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className={`${plex.className} w-full bg-[#5B1A1E] text-[#F3ECDD] text-sm py-3 rounded-md hover:bg-[#4A1417] transition disabled:opacity-50 font-medium mt-1`}>
              {loading ? "Please wait..." : isSignUp ? "Create admin account" : "Log in as admin"}
            </button>

            <button onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              className={`${plex.className} text-sm text-[#8A7A63] hover:text-[#5B1A1E] transition text-center`}>
              {isSignUp ? "Already have an account? Log in as admin" : "Don't have an account? Create admin account"}
            </button>
          </div>
        </div>

        <p className={`${plex.className} text-center text-[#8A7A63] text-xs mt-6`}>
          If you're an intern, use the Intern Portal instead.
        </p>
      </div>
    </main>
  );
}