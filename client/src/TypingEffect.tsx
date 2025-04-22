import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface TypingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  onTypingStart?: () => void;
  onTyping?: () => void;
}

const TypingEffect: React.FC<TypingEffectProps> = ({
  text,
  speed = 10,
  onComplete,
  onTypingStart,
  onTyping,
}) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!text) return;

    onTypingStart?.();
    setDisplayedText("");
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex >= text.length) {
        clearInterval(interval);
        onComplete?.();
        return;
      }

      setDisplayedText(text.slice(0, currentIndex + 1));
      onTyping?.(); // Call scroll on every character render
      currentIndex++;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return <div dangerouslySetInnerHTML={{ __html: displayedText }} />;
};

export default TypingEffect;
