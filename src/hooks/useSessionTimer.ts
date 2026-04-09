import { useEffect, useRef, useState } from 'react';

import type { ExamSession } from '../types/models';
import { getRemainingSeconds } from '../utils/quiz';

export function useSessionTimer(session: ExamSession | null, onExpire?: () => void) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    session ? getRemainingSeconds(session) : 0,
  );
  const didExpireRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!session) {
      setRemainingSeconds(0);
      didExpireRef.current = false;
      return;
    }

    didExpireRef.current = false;

    const update = () => {
      const nextValue = getRemainingSeconds(session);
      setRemainingSeconds(nextValue);
      if (nextValue === 0 && session.expiresAt && !didExpireRef.current) {
        didExpireRef.current = true;
        onExpireRef.current?.();
      }
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [session]);

  return remainingSeconds;
}
