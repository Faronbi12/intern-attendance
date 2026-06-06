"use client";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
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
      if (error) setError(error.message);
      else setError("Check your email to confirm your account!");
    } else {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      
      // Check role and redirect accordingly
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {isSignUp ? "Create account" : "Welcome back"}
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            {isSignUp ? "Sign up to track your attendance" : "Log in to your attendance account"}
          </p>

          <div className="flex flex-col gap-3">
            <input type="email" placeholder="Email address" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400" />
            <input type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400" />

            {error && (
              <p className={`text-sm ${error.includes("Check your email") ? "text-green-600" : "text-red-500"}`}>
                {error}
              </p>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-gray-900 text-white text-sm py-3 rounded-xl hover:bg-gray-700 transition disabled:opacity-50">
              {loading ? "Please wait..." : isSignUp ? "Create account" : "Log in"}
            </button>

            <button onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              className="text-sm text-gray-400 hover:text-gray-600 transition text-center">
              {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}