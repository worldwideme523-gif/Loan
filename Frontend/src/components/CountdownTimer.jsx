import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
      <h3 className="text-xl font-bold mb-4 text-center">Withdrawal Available In:</h3>
      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-3xl font-bold">{timeLeft.days}</div>
          <div className="text-sm">Days</div>
        </div>
        <div>
          <div className="text-3xl font-bold">{timeLeft.hours}</div>
          <div className="text-sm">Hours</div>
        </div>
        <div>
          <div className="text-3xl font-bold">{timeLeft.minutes}</div>
          <div className="text-sm">Minutes</div>
        </div>
        <div>
          <div className="text-3xl font-bold">{timeLeft.seconds}</div>
          <div className="text-sm">Seconds</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;