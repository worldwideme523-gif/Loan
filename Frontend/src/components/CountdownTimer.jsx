import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

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

  const items = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-sm">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="size-4 opacity-80" />
          <span className="text-sm font-medium opacity-90">Withdrawal Available In:</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {items.map(item => (
            <div key={item.label} className="rounded-lg bg-black/10 backdrop-blur-sm p-2 md:p-3">
              <div className="text-xl md:text-2xl font-bold tabular-nums">{String(item.value).padStart(2, '0')}</div>
              <div className="text-[10px] md:text-xs opacity-80 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CountdownTimer;
