import { TypeAnimation } from "react-type-animation";
import { Box, Text } from "@chakra-ui/react";

export default function HeroTyping() {
  return (
    <Box textAlign="center" py={12}>
      <Text
        fontSize="4xl"
        fontWeight="bold"
        color="white"
        textShadow="0 0 20px rgba(168, 85, 247, 0.8)"
      >
        <TypeAnimation
          sequence={[
            "Build something incredible",
            2000,
            "Brainstorm your next big idea",
            2000,
            "Let's get to work",
            2000,
          ]}
          wrapper="span"
          cursor={true} // ✅ Blinking cursor restored
          repeat={Infinity}
        />
      </Text>
    </Box>
  );
}
