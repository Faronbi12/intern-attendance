 "use client";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";

export default function InternLoginPage() {
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
      else setError("Check your email to confirm your account!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        <button onClick={() => router.push("/landing")}
          className="text-slate-400 text-sm mb-6 hover:text-white transition">
          ← Back
        </button>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl">👨‍💼</div>
            <div>
              <h1 className="text-white font-bold text-lg">{isSignUp ? "Create Intern Account" : "Intern Login"}</h1>
              <p className="text-slate-400 text-xs">Intern Attendance Portal</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <input type="email" placeholder="Email address" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-slate-500" />
            <input type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-slate-500" />

            {error && (
              <p className={`text-sm ${error.includes("Check your email") ? "text-green-400" : "text-red-400"}`}>
                {error}
              </p>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-blue-600 text-white text-sm py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-medium">
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Log In"}
            </button>

            <button onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              className="text-sm text-slate-400 hover:text-white transition text-center">
              {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
