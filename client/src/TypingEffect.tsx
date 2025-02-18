import React, { useState, useEffect } from "react";

interface TypingEffectProps {
  text: string;
  speed?: number;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text, speed = 10 }) => {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    if (!text) return;

    setDisplayedText(""); // Reset on new input
    setIndex(0);

    const interval = setInterval(() => {
      setDisplayedText((prev) => text.slice(0, prev.length + 1));
      setIndex((prevIndex) => prevIndex + 1);

      if (index >= text.length - 1) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text]);

  return <div dangerouslySetInnerHTML={{ __html: displayedText }} />;
};

export default TypingEffect;
