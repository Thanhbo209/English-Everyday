import { useState, useEffect, useRef, useCallback } from "react";

export interface UseGameTimerOptions {
  durationSeconds?: number;
  onTimeout?: () => void;
  autoStart?: boolean;
}

export function useGameTimer(options: UseGameTimerOptions = {}) {
  const { durationSeconds = 60, onTimeout, autoStart = true } = options;

  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef<any>(null);

  const resetTimer = useCallback((newDuration: number = durationSeconds) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSecondsLeft(newDuration);
    setTimeElapsed(0);
    setIsActive(autoStart);
  }, [durationSeconds, autoStart]);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const resume = useCallback(() => {
    setIsActive(true);
  }, []);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsActive(false);
          if (onTimeout) {
            onTimeout();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, onTimeout]);

  return {
    secondsLeft,
    timeElapsed,
    isActive,
    pause,
    resume,
    reset: resetTimer,
  };
}
