import { useState, useRef, useEffect } from "react";
import { Box, VStack, HStack, Input, Button, Text } from "@chakra-ui/react";
import { callOpenRouter } from "./api";
import TypingMessage from "./TypingMessage";

export default function ChatLayout() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi! What would you like to brainstorm today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Call OpenRouter
      const aiReply = await callOpenRouter(input);
      const aiMsg = { sender: "ai", text: aiReply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Error fetching reply." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HStack h="100vh" spacing={0} align="stretch">
      {/* Sidebar */}
      <Box
        w="260px"
        bgGradient="linear(to-b, purple.800, black)"
        color="white"
        p={5}
        boxShadow="xl"
      >
        <Text fontSize="xl" fontWeight="bold" mb={6}>
          Branches
        </Text>
        <Text>🌟 Root Branch</Text>
      </Box>

      {/* Main Chat Area */}
      <Box flex="1" display="flex" flexDirection="column" bg="gray.50">
        {/* Messages */}
        <VStack
          flex="1"
          align="stretch"
          spacing={6}
          p={6}
          overflowY="auto"
          maxW="900px"
          mx="auto"
          w="100%"
        >
          {messages.map((msg, idx) => (
            <Box
              key={idx}
              alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"}
              bg={msg.sender === "user" ? "purple.600" : "white"}
              color={msg.sender === "user" ? "white" : "black"}
              px={5}
              py={3}
              borderRadius="lg"
              boxShadow="sm"
              maxW="full"
              border={msg.sender === "ai" ? "1px solid #ddd" : "none"}
              fontSize="md"
            >
              {msg.sender === "ai" ? (
                <TypingMessage text={msg.text} />
              ) : (
                msg.text
              )}
            </Box>
          ))}

          {loading && (
            <Box
              alignSelf="flex-start"
              bg="white"
              color="black"
              px={4}
              py={2}
              borderRadius="lg"
              border="1px solid #ddd"
              fontStyle="italic"
            >
              Thinking…
            </Box>
          )}

          <div ref={chatEndRef} />
        </VStack>

        {/* Input Box fixed at bottom */}
        <Box
          p={4}
          borderTop="1px solid #ddd"
          bg="white"
          position="sticky"
          bottom="0"
          w="100%"
          maxW="900px"
          mx="auto"
        >
          <HStack>
            <Input
              placeholder="Type a message..."
              bg="gray.100"
              borderRadius="full"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              _focus={{
                borderColor: "purple.400",
                boxShadow: "0 0 15px rgba(168, 85, 247, 0.6)",
              }}
            />
            <Button
              colorScheme="purple"
              borderRadius="full"
              onClick={handleSend}
              isLoading={loading}
            >
              Send
            </Button>
          </HStack>
        </Box>
      </Box>
    </HStack>
  );
}
