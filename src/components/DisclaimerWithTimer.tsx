'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function DisclaimerWithTimer() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 12000;
    const interval = 50;
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

  const disclaimer = (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-[9999] flex justify-center px-3 py-3 sm:py-4">
      <div className="w-full max-w-2xl rounded-lg border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface)_95%,#ffffff_5%)] px-4 py-3 pr-12 text-xs leading-relaxed text-[var(--text-soft)] shadow-[var(--shadow-soft)] sm:text-[13px] relative">
        Si el servidor no responde al primer intento, espera unos segundos y vuelve a intentar.
        Cuando Render esta en reposo, puede tardar un momento en despertar.

        <div className="absolute top-1/2 right-3 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.2"
            />
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
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(disclaimer, document.body) : null;
}
