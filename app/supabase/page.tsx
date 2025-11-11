"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
export default function TestPage() {
  return <SupabaseTestComponent />;
}

function SupabaseTestComponent() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split("T")[1];
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs((prev) => [...prev, logMessage]);
  };

  const fetchData = async () => {
    const fetchId = Date.now();
    addLog(`Starting fetch #${fetchCount + 1} (ID: ${fetchId})`);

    setLoading(true);
    setError(null);
    setFetchCount((prev) => prev + 1);

    try {
      addLog(`Executing query (ID: ${fetchId})`);

      // Super simple query - just get one trick
      const { data: tricks, error: queryError } = await supabase
        .from("tricks")
        .select("id, name")
        .limit(1);

      addLog(`Query completed (ID: ${fetchId})`);

      if (queryError) {
        throw queryError;
      }

      setData(tricks);
      addLog(`Data set successfully: ${JSON.stringify(tricks)}`);
    } catch (err: any) {
      addLog(`Error caught: ${err?.message || "Unknown error"}`);
      setError(err?.message || "Unknown error");
    } finally {
      addLog(`Finally block reached (ID: ${fetchId})`);
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    addLog("Component mounted");
    fetchData();

    return () => {
      addLog("Component unmounting");
    };
  }, []);

  // Monitor visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      addLog(`Visibility changed: ${document.visibilityState}`);
    };

    const handleFocus = () => addLog("Window focused");
    const handleBlur = () => addLog("Window blurred");

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>

      <div className="space-y-4">
        {/* Status */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Status:</h2>
          <div>Loading: {loading ? "✅ Yes" : "❌ No"}</div>
          <div>Fetch Count: {fetchCount}</div>
          <div>Has Data: {data ? "✅ Yes" : "❌ No"}</div>
          <div>Has Error: {error ? `❌ ${error}` : "✅ No"}</div>
        </div>

        {/* Data */}
        {data && (
          <div className="bg-green-100 p-4 rounded">
            <h2 className="font-semibold mb-2">Data:</h2>
            <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 p-4 rounded">
            <h2 className="font-semibold mb-2">Error:</h2>
            <p>{error}</p>
          </div>
        )}

        {/* Manual Controls */}
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? "Fetching..." : "Manual Fetch"}
          </button>

          <button
            onClick={() => setLogs([])}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Clear Logs
          </button>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Debug Info:</h2>
          <div className="text-xs space-y-1">
            <div>
              Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30)}
              ...
            </div>
            <div>
              Has Anon Key:{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅" : "❌"}
            </div>
            <div>
              Supabase Client:{" "}
              {supabase ? "✅ Initialized" : "❌ Not initialized"}
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-black text-green-400 p-4 rounded font-mono text-xs">
          <h2 className="font-semibold mb-2">Logs (newest first):</h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {logs
              .slice()
              .reverse()
              .map((log, i) => (
                <div key={`${log}-${i}`}>{log}</div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
