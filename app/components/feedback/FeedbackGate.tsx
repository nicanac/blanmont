'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuthOptional } from '@/app/context/AuthContext';

// Layer 2: the overlay chunk is only requested once the server says this visitor may use it.
const FeedbackOverlay = dynamic(() => import('./FeedbackOverlay'), { ssr: false });

/**
 * Zero-overhead gate for the visual feedback tool.
 * Layer 1 = admin switch in /admin/settings (RTDB), layer 3 = NEXT_PUBLIC_FEEDBACK_ENABLED=false kill-switch.
 */
export default function FeedbackGate(): React.ReactElement | null {
  const userId = useAuthOptional()?.user?.id ?? null;
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_FEEDBACK_ENABLED === 'false') return;
    let cancelled = false;
    fetch('/api/feedback/config', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : { allowed: false }))
      .then((data: { allowed?: boolean }) => {
        if (!cancelled) setAllowed(data.allowed === true);
      })
      .catch(() => {
        if (!cancelled) setAllowed(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return allowed ? <FeedbackOverlay /> : null;
}
