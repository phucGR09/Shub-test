import { useState, useEffect } from "react";
import { TIMING } from "../constants";

/**
 * Custom hook to manage welcome screen visibility
 * @param {number} duration - Duration in milliseconds to show welcome screen
 * @returns {boolean} - Whether welcome screen should be visible
 */
export const useWelcomeScreen = (duration = TIMING.WELCOME_SCREEN_DURATION) => {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return showWelcome;
};
