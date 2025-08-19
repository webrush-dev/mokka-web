import { CountdownPage } from '@/components/countdown/countdown-page';
import { shouldShowCountdown } from '@/lib/launch-date';

export default function Home() {
  // Check if we should show countdown or landing page
  const showCountdown = shouldShowCountdown();
  
  if (showCountdown) {
    return <CountdownPage />;
  }
  
  // TODO: Implement Landing Page component
  return (
    <div className="min-h-screen flex items-center justify-center bg-mokka-cr">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-mokka-gy mb-4">
          Mokka Coffee е отворено!
        </h1>
        <p className="text-lg text-mokka-gy/80">
          Landing page ще бъде добавена скоро
        </p>
      </div>
    </div>
  );
}
