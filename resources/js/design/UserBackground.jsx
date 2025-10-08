import React, { useMemo } from "react";
import "../../css/design/UserDesign.css";
import bgImg from "../img/userdesign.jpg"; // <- update this path

export default function UserBackground({
  particleCount = 28,    // number of floating particles
  waveformColor = "rgba(255,255,255,0.9)",
  overlayDark = 0.36,    // darkness of the center overlay
}) {
  // create particles once
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => {
      const size = Math.round(8 + Math.random() * 36); // px
      const left = Math.random() * 100; // %
      const top = Math.random() * 100; // %
      const delay = Math.random() * -12; // seconds negative to spread start
      const duration = 8 + Math.random() * 18; // s
      const opacity = 0.08 + Math.random() * 0.35;
      const blur = Math.round(0 + Math.random() * 6); // px
      return { id: i, size, left, top, delay, duration, opacity, blur };
    });
  }, [particleCount]);

  return (
    <div className="live-wallpaper-root" role="img" aria-label="Animated wallpaper">
      {/* Background image */}
      <div
        className="lw-bg"
        style={{
          backgroundImage: `url(${bgImg})`,
        }}
      />

      {/* soft gradient/center vignette */}
      <div
        className="lw-overlay"
        style={{ background: `rgba(8,10,16,${overlayDark})` }}
      />

      {/* animated floating particles */}
      <div className="lw-particles" aria-hidden>
        {particles.map((p) => (
          <span
            key={p.id}
            className="lw-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              opacity: p.opacity,
              filter: `blur(${p.blur}px)`,
            }}
          />
        ))}
      </div>

      {/* animated waveform overlay (SVG) */}
      <div className="lw-wave-wrap" aria-hidden>
        <svg
          className="lw-wave"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor={waveformColor} stopOpacity="0.12" />
              <stop offset="100%" stopColor={waveformColor} stopOpacity="0.06" />
            </linearGradient>
          </defs>

          {/* repeated path that will be translated horizontally */}
          <g className="lw-wave-group" fill="none" stroke={waveformColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M0 60 Q 60 30 120 60 T 360 60 T 600 60 T 840 60 T 1080 60 T 1320 60" strokeOpacity="0.16"/>
            <path d="M0 60 Q 60 80 120 60 T 360 60 T 600 60 T 840 60 T 1080 60 T 1320 60" strokeOpacity="0.08" transform="translate(0,6)"/>
            <path d="M0 60 Q 60 20 120 60 T 360 60 T 600 60 T 840 60 T 1080 60 T 1320 60" strokeOpacity="0.12" transform="translate(-40,-4)"/>
            <rect x="0" y="0" width="1320" height="120" fill="url(#g1)" opacity="0.08" />
          </g>
        </svg>
      </div>

      {/* optional central subtle glow */}
      <div className="lw-center-glow" />

      {/* slot for children content (optional) */}
      <div className="lw-content">
        {/* Example text — remove if you don't need it */}
        <h1>Event Sound Scheduling</h1>
        <p>Plan, reserve and manage your sound events easily.</p>
      </div>
    </div>
  );
}
