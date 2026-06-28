import { useState, useEffect, useRef, useCallback } from "react";

export interface UseQuestionTimerOptions {
  durationSeconds?: number; // Configurable duration
  onTimeout?: () => void; // Triggered when timer hits 0
  autoStart?: boolean;
}

export function useQuestionTimer(options: UseQuestionTimerOptions = {}) {
  const { durationSeconds = 15, onTimeout, autoStart = true } = options;

  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const timerRef = useRef<any>(null);

  // Restart timer with new duration
  const resetTimer = useCallback((newDuration: number = durationSeconds) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSecondsLeft(newDuration);
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
    isActive,
    pause,
    resume,
    reset: resetTimer,
  };
}
