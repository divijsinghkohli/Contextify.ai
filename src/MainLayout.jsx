import React, { useState } from "react";
import { Box, Flex, IconButton, Input, Button, Text } from "@chakra-ui/react";
import { FiMenu, FiArrowUp } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TypeAnimation } from "react-type-animation";
import { streamOpenRouter } from "./api";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function MainLayout() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [started, setStarted] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!started) {
      setStarted(true);
    }

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");

    // Add placeholder assistant message
    setMessages((prev) => [...prev, { role: "assistant", content: "Thinking..." }]);
    setLoading(true);

    try {
      await streamOpenRouter(
        [...messages, { role: "user", content: input }], // ✅ full conversation history
        (partial) => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[prev.length - 1].content = partial;
            return updated;
          });
        },
        (finalText) => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[prev.length - 1].content = finalText.trim();
            return updated;
          });
          setLoading(false);
        }
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[prev.length - 1].content = "⚠️ Error fetching response.";
        return updated;
      });
      setLoading(false);
    }
  };

  return (
    <Flex h="100vh" bgGradient="linear(to-b, purple.900, black)" position="relative" overflow="hidden">
      {/* Floating glowing orbs */}
      <Box
        position="absolute"
        w="300px"
        h="300px"
        bg="yellow.200"
        borderRadius="50%"
        filter="blur(150px)"
        opacity={0.3}
        top="10%"
        left="15%"
        animation="float 12s ease-in-out infinite"
      />
      <Box
        position="absolute"
        w="250px"
        h="250px"
        bg="whiteAlpha.800"
        borderRadius="50%"
        filter="blur(120px)"
        opacity={0.2}
        bottom="20%"
        right="20%"
        animation="float 15s ease-in-out infinite alternate"
      />

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-30px) translateX(20px); }
            100% { transform: translateY(0px) translateX(0px); }
          }
        `}
      </style>

      {/* Sidebar */}
      <Box
        w={sidebarOpen ? "250px" : "0px"}
        bg="purple.800"
        color="white"
        p={sidebarOpen ? 4 : 0}
        transition="all 0.3s ease"
        overflow="hidden"
        zIndex="2"
      >
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          🌟 Branches
        </Text>
        <Text>Root Branch</Text>
      </Box>

      {/* Main Content */}
      <Flex direction="column" flex="1" position="relative" zIndex="2">
        {/* Top Bar */}
        <Flex p={4} bg="transparent" color="white" align="center">
          <IconButton
            icon={<FiMenu />}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            variant="ghost"
            colorScheme="whiteAlpha"
          />
        </Flex>

        {/* Hero BEFORE chat */}
        {!started ? (
          <Flex flex="1" direction="column" align="center" justify="flex-start" pt="15%">
            <TypeAnimation
              sequence={[
                "Build something incredible",
                2000,
                "Brainstorm your next idea",
                2000,
                "Let’s get to work",
                2000,
              ]}
              wrapper="h1"
              speed={50}
              style={{
                fontSize: "2.8rem",
                color: "white",
                fontWeight: "bold",
                textShadow: "0 0 25px rgba(255, 255, 200, 0.6)",
              }}
              repeat={Infinity}
              cursor={true}
            />
            <Flex mt={8} w="60%" maxW="600px">
              <Input
                placeholder="Type your idea..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                mr={2}
                color="white"
                bg="blackAlpha.700"
                border="2px solid"
                borderColor="purple.400"
                borderRadius="full"
                px={6}
                py={6}
                fontSize="lg"
                _focus={{ borderColor: "yellow.300", boxShadow: "0 0 20px yellow" }}
              />
              <IconButton
                onClick={handleSend}
                icon={<FiArrowUp />}
                colorScheme="purple"
                aria-label="Send"
                borderRadius="full"
                ml={2}
                _hover={{ boxShadow: "0 0 20px purple" }}
                h="auto"
                minW="60px"
                minH="60px"
                fontSize="20px"
              />
            </Flex>
          </Flex>
        ) : (
          // Chat AFTER first message
          <>
            <Flex flex="1" direction="column" p={6} overflowY="auto" css={{ scrollbarWidth: "thin" }}>
              {messages.map((msg, i) => (
                <Box
                  key={i}
                  alignSelf={msg.role === "user" ? "flex-end" : "center"}
                  bg={msg.role === "user" ? "purple.500" : "transparent"}
                  color={msg.role === "user" ? "white" : "white"}
                  px={msg.role === "user" ? 4 : 0}
                  py={msg.role === "user" ? 2 : 0}
                  borderRadius={msg.role === "user" ? "lg" : "none"}
                  mb={4}
                  maxW="80%"
                  whiteSpace="pre-wrap"
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <Box as="div" my={2} borderRadius="md" overflow="hidden">
                              <SyntaxHighlighter
                                style={atomOneDark}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            </Box>
                          ) : (
                            <code
                              style={{
                                backgroundColor: "rgba(255,255,255,0.1)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </Box>
              ))}
            </Flex>

            {/* Chat Input */}
            <Flex p={4} bg="blackAlpha.800" align="center">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                mr={2}
                color="white"
                bg="blackAlpha.700"
                border="1px solid"
                borderColor="purple.500"
              />
              <Button onClick={handleSend} colorScheme="purple" disabled={loading}>
                Send
              </Button>
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
}
