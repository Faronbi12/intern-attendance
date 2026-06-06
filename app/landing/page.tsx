"use client";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo / Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Intern Attendance System</h1>
          <p className="text-slate-400 text-sm mt-2">Select your portal to continue</p>
        </div>

        {/* Portal buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/intern-login")}
            className="w-full flex items-center gap-4 p-5 bg-slate-800 border border-slate-700 rounded-2xl hover:bg-slate-700 hover:border-blue-500 transition group">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shrink-0">
              👨‍💼
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">Intern Portal</p>
              <p className="text-slate-400 text-sm">Check in, check out and track your attendance</p>
            </div>
            <span className="ml-auto text-slate-600 group-hover:text-blue-400 transition">→</span>
          </button>

          <button
            onClick={() => router.push("/admin-login")}
            className="w-full flex items-center gap-4 p-5 bg-slate-800 border border-slate-700 rounded-2xl hover:bg-slate-700 hover:border-blue-500 transition group">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-2xl shrink-0">
              🛡️
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">Admin Portal</p>
              <p className="text-slate-400 text-sm">Monitor and manage all intern attendance</p>
            </div>
            <span className="ml-auto text-slate-600 group-hover:text-blue-400 transition">→</span>
          </button>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          Intern Attendance System © 2026
        </p>
      </div>
    </main>
  );
}