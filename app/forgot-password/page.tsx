"use client";
import { useState, Suspense } from "react";
import { supabase } from "../supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"] });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"] });

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portal = searchParams.get("portal") === "admin" ? "admin" : "intern";
  const loginPath = portal === "admin" ? "/admin-login" : "/intern-login";

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setError("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        error.status === 429 ||
        msg.includes("rate limit") ||
        msg.includes("security purposes")
      ) {
        setError("Please wait a minute before asking for another code.");
      } else {
        setError("Something went wrong. Please try again shortly.");
      }
      setLoading(false);
      return;
    }

    // The same result is shown whether or not the email has an account,
    // so this page can never be used to find out who is registered.
    router.push(
      `/reset-password?email=${encodeURIComponent(cleanEmail)}&portal=${portal}`
    );
  };

  return (
    <main className="min-h-screen bg-[#F3ECDD] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        <button onClick={() => router.push(loginPath)}
          className={`${plex.className} flex items-center gap-1.5 text-[#8A7A63] text-sm mb-6 hover:text-[#5B1A1E] transition`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to login
        </button>

        <div className="bg-[#EDE3CC] border border-[#D9CBA8] rounded-md px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full border border-[#5B1A1E] flex items-center justify-center shrink-0 text-[#5B1A1E]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className={`${fraunces.className} text-[#2B211A] text-lg`}>
                Forgot password
              </h1>
              <p className={`${plex.className} text-[#8A7A63] text-xs`}>
                We’ll email you a code to reset it
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className={`${plex.className} text-xs text-[#8A7A63]`}>Email address</label>
              <input type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${plex.className} w-full text-sm bg-transparent border-b border-[#B8A97E] text-[#2B211A] py-2 focus:outline-none focus:border-[#5B1A1E] transition-colors`} />
            </div>

            {error && (
              <p className={`${plex.className} text-sm text-[#5B1A1E]`}>
                {error}
              </p>
            )}

            <button onClick={handleSend} disabled={loading}
              className={`${plex.className} w-full bg-[#5B1A1E] text-[#F3ECDD] text-sm py-3 rounded-md hover:bg-[#4A1417] transition disabled:opacity-50 font-medium mt-1`}>
              {loading ? "Please wait..." : "Send reset code"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}