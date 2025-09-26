import { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";

export default function TypingMessage({ text }) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Typing effect
  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 20); // typing speed
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  // Cursor blinking
  useEffect(() => {
    const blink = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);
    return () => clearInterval(blink);
  }, []);

  return (
    <Box as="span" whiteSpace="pre-wrap">
      {displayed}
      {cursorVisible && <Box as="span">▋</Box>} {/* ✅ cursor follows text */}
    </Box>
  );
}
