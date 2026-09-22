"use client";
import { useState, Suspense } from "react";
import { supabase } from "../supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"] });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"] });

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyPageContent />
    </Suspense>
  );
}

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const portal = searchParams.get("portal") || "intern";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });

    if (error) {
      setError("That code is incorrect or has expired. Please check and try again.");
      setLoading(false);
      return;
    }

    // Sign the user out of the temporary session created by verifyOtp,
    // so they log in normally through the correct portal.
    await supabase.auth.signOut();

    router.push(portal === "admin" ? "/admin-login" : "/intern-login");
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) {
      setError("Could not resend code. Please try again shortly.");
    } else {
      setError("A new code has been sent to your email.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#F3ECDD] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
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
                Verify your email
              </h1>
              <p className={`${plex.className} text-[#8A7A63] text-xs`}>
                {email ? `Code sent to ${email}` : "Enter the code sent to your email"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className={`${plex.className} text-xs text-[#8A7A63]`}>Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className={`${plex.className} w-full text-lg tracking-[0.3em] bg-transparent border-b border-[#B8A97E] text-[#2B211A] py-2 focus:outline-none focus:border-[#5B1A1E] transition-colors`}
              />
            </div>

            {error && (
              <p className={`${plex.className} text-sm ${error.includes("new code") ? "text-[#3F6B4F]" : "text-[#5B1A1E]"}`}>
                {error}
              </p>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className={`${plex.className} w-full bg-[#5B1A1E] text-[#F3ECDD] text-sm py-3 rounded-md hover:bg-[#4A1417] transition disabled:opacity-50 font-medium mt-1`}
            >
              {loading ? "Please wait..." : "Verify"}
            </button>

            <button
              onClick={handleResend}
              disabled={loading}
              className={`${plex.className} text-sm text-[#8A7A63] hover:text-[#5B1A1E] transition text-center`}
            >
              Didn't get a code? Resend
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
