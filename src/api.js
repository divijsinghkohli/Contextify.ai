export async function streamOpenRouter(messages, onUpdate, onComplete) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // fast + good quality
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      }),
    });
  
    if (!response.ok || !response.body) {
      throw new Error("Failed to connect to OpenRouter API");
    }
  
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
  
      const chunk = decoder.decode(value, { stream: true });
  
      const lines = chunk
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && line.startsWith("data:"));
  
      for (const line of lines) {
        if (line === "data: [DONE]") {
          onComplete(fullText);
          return;
        }
  
        try {
          const json = JSON.parse(line.replace(/^data:\s*/, ""));
          const token = json.choices?.[0]?.delta?.content || "";
          if (token) {
            fullText += token;
            onUpdate(fullText);
          }
        } catch (err) {
          console.error("Error parsing stream chunk:", err, line);
        }
      }
    }
  }
  