"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChooseRole() {
  const [role, setRole] = useState<"buyer" | "vendor" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to set role");
      } else {
        router.push(role === "vendor" ? "/vendor" : "/dashboard");
      }
    } catch {
      setError("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container min-h-screen flex flex-col items-center justify-center py-16">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-center">Choose your role</h1>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="flex gap-4 items-center justify-center mb-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="role" value="buyer" checked={role === "buyer"} onChange={() => setRole("buyer")}/>
              Buyer
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="role" value="vendor" checked={role === "vendor"} onChange={() => setRole("vendor")}/>
              Vendor
            </label>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading || !role} className="btn-primary w-full">
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
} 