import { useState, useEffect, useRef } from "react";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const play = (url: string) => {
    if (!url) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setLoading(true);
    setIsPlaying(false);

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.oncanplaythrough = () => {
      setLoading(false);
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    };

    audio.onplaying = () => {
      setIsPlaying(true);
    };

    audio.onended = () => {
      setIsPlaying(false);
    };

    audio.onerror = () => {
      setLoading(false);
      setIsPlaying(false);
    };

    audio.load();
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return { play, stop, isPlaying, loading };
}
