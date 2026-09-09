"use client";

import { useState } from "react";
import Film from "./Film";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Page() {
  const [fullscreenHint, setFullscreenHint] = useState("View full screen");

  return (
    <main>
      <nav className="nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="CookPilot, back to top">
          <span className="brand-mark">c<span>↗</span></span>
          CookPilot
        </a>
        <div className="nav-links">
          <a href="#film">The film</a>
          <a href="#serve">The plate</a>
        </div>
        <button
          className="fullscreen"
          aria-label={fullscreenHint}
          title={fullscreenHint}
          onClick={async () => {
            try {
              if (document.fullscreenElement) await document.exitFullscreen();
              else await document.documentElement.requestFullscreen();
            } catch {
              setFullscreenHint("Use F11 for full screen");
            }
          }}
        >⛶</button>
        <a href="https://cookpilot.pro/en" className="nav-cta">Get cooking <Arrow /></a>
      </nav>
      <Film />
    </main>
  );
}
