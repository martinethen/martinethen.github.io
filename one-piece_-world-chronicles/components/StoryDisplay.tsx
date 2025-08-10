
import React, { useState, useEffect, useRef } from 'react';

interface StoryDisplayProps {
  text: string;
  speed?: number;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ text, speed = 20 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Ensure any existing interval is cleared before starting a new one.
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setDisplayedText(''); // Reset on new text

    // Don't start an interval for empty text.
    if (!text) {
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setDisplayedText(currentDisplayedText => {
        // If we've displayed the whole string, stop the interval.
        if (currentDisplayedText.length === text.length) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return currentDisplayedText;
        }
        // Otherwise, reveal the next character.
        return text.substring(0, currentDisplayedText.length + 1);
      });
    }, speed);

    // Cleanup function to clear the interval when the component unmounts or text changes.
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed]);

  const handleSkip = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDisplayedText(text);
  };

  return <p onClick={handleSkip} className="text-lg/relaxed text-gray-700 whitespace-pre-wrap cursor-pointer">{displayedText}</p>;
};
