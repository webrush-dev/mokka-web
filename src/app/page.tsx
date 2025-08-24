import { CountdownPage } from '@/components/countdown/countdown-page';
import LandingPage from '@/components/landing/landing-page';
import { shouldShowCountdown } from '@/lib/launch-date';

export default function Home() {
  // Check if we should show countdown or landing page
  const showCountdown = shouldShowCountdown();
  
  if (showCountdown) {
    return <CountdownPage />;
  }
  
  return <LandingPage />;
}
