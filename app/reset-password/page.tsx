"use client";
import { useState, Suspense } from "react";
import { supabase } from "../supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"] });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"] });

const PASSWORD_RULES =
  "Password must be at least 12 characters long and contain uppercase and lowercase letters, a number, and a special character.";

const isStrongPassword = (p: string) =>
  p.length >= 12 &&
  /[a-z]/.test(p) &&
  /[A-Z]/.test(p) &&
  /\d/.test(p) &&
  /[^A-Za-z0-9]/.test(p);

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const portal = searchParams.get("portal") === "admin" ? "admin" : "intern";
  const loginPath = portal === "admin" ? "/admin-login" : "/intern-login";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    setError("");

    if (!email) {
      setError("Something is missing. Please start again from the login page.");
      return;
    }
    if (!codeVerified && code.length < 6) {
      setError("Please enter the code from your email.");
      return;
    }
    if (!isStrongPassword(password)) {
      setError(PASSWORD_RULES);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);

    // Step 1: check the code (skipped if it was already accepted
    // and only the password needs another try).
    if (!codeVerified) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "recovery",
      });

      if (verifyError) {
        setError("That code is incorrect or has expired. Please check and try again.");
        setLoading(false);
        return;
      }
      setCodeVerified(true);
    }

    // Step 2: save the new password.
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      const msg = updateError.message.toLowerCase();
      if (msg.includes("different from the old password")) {
        setError("Your new password must be different from your old one.");
      } else if (msg.includes("password")) {
        setError(PASSWORD_RULES);
      } else {
        setError(updateError.message);
      }
      setLoading(false);
      return;
    }

    // Sign out everywhere so the person logs in fresh with the new password.
    await supabase.auth.signOut();
    setDone(true);
    setLoading(false);
    setTimeout(() => router.push(loginPath), 2000);
  };

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setError("Could not resend the code. Please wait a minute and try again.");
    } else {
      setError("A new code has been sent to your email.");
    }
    setLoading(false);
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
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className={`${fraunces.className} text-[#2B211A] text-lg`}>
                Reset your password
              </h1>
              <p className={`${plex.className} text-[#8A7A63] text-xs`}>
                {email
                  ? `If an account exists for ${email}, a code has been sent.`
                  : "Enter the code sent to your email"}
              </p>
            </div>
          </div>

          {done ? (
            <p className={`${plex.className} text-sm text-[#3F6B4F]`}>
              Your password has been updated. Taking you to the login page...
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {!codeVerified && (
                <div className="flex flex-col gap-1">
                  <label className={`${plex.className} text-xs text-[#8A7A63]`}>Reset code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter your code"
                    className={`${plex.className} w-full text-lg tracking-[0.3em] bg-transparent border-b border-[#B8A97E] text-[#2B211A] py-2 focus:outline-none focus:border-[#5B1A1E] transition-colors`}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className={`${plex.className} text-xs text-[#8A7A63]`}>New password</label>
                <input type="password" value={password} autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${plex.className} w-full text-sm bg-transparent border-b border-[#B8A97E] text-[#2B211A] py-2 focus:outline-none focus:border-[#5B1A1E] transition-colors`} />
              </div>

              <div className="flex flex-col gap-1">
                <label className={`${plex.className} text-xs text-[#8A7A63]`}>Confirm new password</label>
                <input type="password" value={confirm} autoComplete="new-password"
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`${plex.className} w-full text-sm bg-transparent border-b border-[#B8A97E] text-[#2B211A] py-2 focus:outline-none focus:border-[#5B1A1E] transition-colors`} />
              </div>

              {error && (
                <p className={`${plex.className} text-sm ${error.includes("new code") ? "text-[#3F6B4F]" : "text-[#5B1A1E]"}`}>
                  {error}
                </p>
              )}

              <button
                onClick={handleReset}
                disabled={loading || (!codeVerified && code.length < 6) || !password || !confirm}
                className={`${plex.className} w-full bg-[#5B1A1E] text-[#F3ECDD] text-sm py-3 rounded-md hover:bg-[#4A1417] transition disabled:opacity-50 font-medium mt-1`}>
                {loading ? "Please wait..." : "Save new password"}
              </button>

              {!codeVerified && (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className={`${plex.className} text-sm text-[#8A7A63] hover:text-[#5B1A1E] transition text-center`}>
                  Didn’t get a code? Resend
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}