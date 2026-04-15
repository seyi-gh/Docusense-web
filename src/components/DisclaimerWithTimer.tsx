'use client';

import { useEffect, useState } from 'react';

export default function DisclaimerWithTimer() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100); // 0-100

  useEffect(() => {
    if (!isVisible) return;

    const duration = 12000; // 12 seconds
    const interval = 50; // Update every 50ms for smooth animation
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);

      setProgress(newProgress);

      if (elapsed >= duration) {
        setIsVisible(false);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <aside className="pointer-events-none fixed bottom-3 left-3 z-50 max-w-[22rem] rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface)_92%,#ffffff_8%)] px-3 py-2 pr-10 text-xs leading-relaxed text-[var(--text-soft)] shadow-[var(--shadow-soft)] sm:bottom-4 sm:left-4 sm:text-[13px] relative">
      Si el servidor no responde al primer intento, espera unos segundos y vuelve a intentar.
      Cuando Render esta en reposo, puede tardar un momento en despertar.

      {/* Circular progress indicator */}
      <div className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.2"
          />
          {/* Progress circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="100.53"
            strokeDashoffset={100.53 - (progress / 100) * 100.53}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 50ms linear',
              transform: 'rotate(-90deg)',
              transformOrigin: '18px 18px',
            }}
          />
        </svg>
      </div>
    </aside>
  );
}
