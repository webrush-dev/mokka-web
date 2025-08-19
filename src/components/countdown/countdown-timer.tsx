'use client';

import { useEffect, useState } from 'react';
import { getLaunchDateInfo } from '@/lib/launch-date';
import { Card, CardContent } from '@/components/ui/card';

interface CountdownUnitProps {
  value: number;
  label: string;
}

function CountdownUnit({ value, label }: CountdownUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-4xl md:text-6xl font-bold text-mokka-br tabular-nums">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-sm md:text-base text-mokka-gy font-medium uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

export function CountdownTimer() {
  const [countdownInfo, setCountdownInfo] = useState(getLaunchDateInfo());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownInfo(getLaunchDateInfo());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (countdownInfo.isLaunched) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-mokka-gy mb-2">
          До откриването остават
        </h2>
        <p className="text-lg text-mokka-gy/80">
          Mokka идва в Тракия
        </p>
      </div>
      
      <Card className="bg-mokka-cr/50 border-mokka-br/20 shadow-lg">
        <CardContent className="p-8">
          <div className="grid grid-cols-4 gap-4 md:gap-8">
            <CountdownUnit 
              value={countdownInfo.daysUntilLaunch} 
              label="Дни" 
            />
            <CountdownUnit 
              value={countdownInfo.hoursUntilLaunch} 
              label="Часа" 
            />
            <CountdownUnit 
              value={countdownInfo.minutesUntilLaunch} 
              label="Минути" 
            />
            <CountdownUnit 
              value={countdownInfo.secondsUntilLaunch} 
              label="Секунди" 
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 text-sm text-mokka-gy/70">
        <p>01.09.2025 • 00:01 • Европа/София</p>
      </div>
    </div>
  );
}
