"use client";
import { useState, useEffect } from "react";

export function Countdown({ targetDate, onComplete, className = "" }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    if (!isClient) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (Object.keys(newTimeLeft).length === 0 && onComplete) {
        onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isClient, targetDate, onComplete]);

  if (!isClient) {
    return (
      <div className={`flex gap-4 justify-center ${className}`}>Loading...</div>
    );
  }

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (timeLeft[interval] === undefined) {
      return;
    }

    timerComponents.push(
      <div
        key={interval}
        className="text-center bg-white/10 rounded-lg p-3 min-w-[60px]"
      >
        <div className="text-2xl font-bold">{timeLeft[interval]}</div>
        <div className="text-sm text-gray-300 capitalize">{interval}</div>
      </div>
    );
  });

  return (
    <div className={`flex gap-4 justify-center ${className}`}>
      {timerComponents.length ? (
        timerComponents
      ) : (
        <div className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold">
          🔥 DROP IS LIVE!
        </div>
      )}
    </div>
  );
}
