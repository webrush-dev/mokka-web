/**
 * Launch date utilities for Mokka Coffee
 * Handles the automatic switch from countdown to landing page on Sep 1, 2025
 */

// Launch date - when to switch from countdown to landing page
// export const LAUNCH_SWITCH_ISO = "2025-09-01T00:01:00+03:00";

// QUICK TEST: Uncomment this line to quickly test the landing page
export const LAUNCH_SWITCH_ISO = '2024-01-01T00:01:00+03:00';

export interface LaunchDateInfo {
  isLaunched: boolean;
  timeUntilLaunch: number;
  daysUntilLaunch: number;
  hoursUntilLaunch: number;
  minutesUntilLaunch: number;
  secondsUntilLaunch: number;
}

/**
 * Get current launch status and countdown information
 */
export function getLaunchDateInfo(): LaunchDateInfo {
  const now = new Date();
  const launchDate = new Date(LAUNCH_SWITCH_ISO);

  const timeUntilLaunch = launchDate.getTime() - now.getTime();
  const isLaunched = timeUntilLaunch <= 0;

  if (isLaunched) {
    return {
      isLaunched: true,
      timeUntilLaunch: 0,
      daysUntilLaunch: 0,
      hoursUntilLaunch: 0,
      minutesUntilLaunch: 0,
      secondsUntilLaunch: 0,
    };
  }

  const daysUntilLaunch = Math.floor(timeUntilLaunch / (1000 * 60 * 60 * 24));
  const hoursUntilLaunch = Math.floor(
    (timeUntilLaunch % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutesUntilLaunch = Math.floor(
    (timeUntilLaunch % (1000 * 60 * 60)) / (1000 * 60),
  );
  const secondsUntilLaunch = Math.floor((timeUntilLaunch % (1000 * 60)) / 1000);

  return {
    isLaunched,
    timeUntilLaunch,
    daysUntilLaunch,
    hoursUntilLaunch,
    minutesUntilLaunch,
    secondsUntilLaunch,
  };
}

/**
 * Check if we should show countdown or landing page
 */
export function shouldShowCountdown(): boolean {
  return !getLaunchDateInfo().isLaunched;
}
