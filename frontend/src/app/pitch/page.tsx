"use client";

import { useEffect } from "react";

export default function PitchPage() {
  useEffect(() => {
    // Redirect to static HTML presentation for zero-margin print perfection
    window.location.href = "/sih-presentation.html";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-slate-300 text-sm">
      Loading SIH Presentation Slides...
    </div>
  );
}
