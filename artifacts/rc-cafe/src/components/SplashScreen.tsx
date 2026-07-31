import { useEffect, useState } from "react";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    // enter → hold after 800ms
    const t1 = setTimeout(() => setPhase("hold"), 800);
    // hold → exit after 2400ms total
    const t2 = setTimeout(() => setPhase("exit"), 2400);
    // unmount after exit animation (400ms)
    const t3 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "28px",
        transition: "opacity 0.4s ease",
        opacity: phase === "exit" ? 0 : 1,
        pointerEvents: phase === "exit" ? "none" : "all",
      }}
    >
      {/* Logo */}
      <div
        style={{
          transition: "transform 0.8s cubic-bezier(0.34,1.56,0.64,1), opacity 0.8s ease",
          transform: phase === "enter" ? "scale(0.4)" : "scale(1)",
          opacity: phase === "enter" ? 0 : 1,
        }}
      >
        <img
          src="/logo.jpeg"
          alt="LA RC Cafe Logo"
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid hsl(0 84% 60%)",
            boxShadow: "0 0 40px hsl(0 84% 60% / 0.5)",
          }}
        />
      </div>

      {/* Welcome text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          transition: "transform 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s, opacity 0.7s ease 0.2s",
          transform: phase === "enter" ? "translateY(20px)" : "translateY(0)",
          opacity: phase === "enter" ? 0 : 1,
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.08em",
            lineHeight: 1,
          }}
        >
          Welcome
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.95rem",
            fontWeight: 400,
            color: "hsl(0 84% 60%)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          LA RC Cafe
        </span>
      </div>

      {/* Thin red underline bar */}
      <div
        style={{
          height: 2,
          borderRadius: 2,
          background: "hsl(0 84% 60%)",
          transition: "width 1s ease 0.5s",
          width: phase === "enter" ? "0px" : "80px",
        }}
      />
    </div>
  );
}
