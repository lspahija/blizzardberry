"use client";
import { useEffect, useState } from "react";

export default function UsagePage() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/credits")
      .then((res) => res.json())
      .then((data) => {
        setCredits(data.credits);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 32 }}>Your Usage</h1>
      <div style={{
        background: "#FFF5E1",
        borderRadius: 16,
        boxShadow: "0 4px 24px #0001",
        padding: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        border: "3px solid #FF4B6B",
      }}>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Credits</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: "#FF4B6B", marginBottom: 8 }}>
          {loading ? "..." : credits}
        </div>
        <div style={{ fontSize: 16, color: "#444" }}>
          {loading ? "Loading your credits..." : `You have ${credits} credits available.`}
        </div>
      </div>
    </div>
  );
}
