import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListOpenaiMessagesQueryKey } from "@workspace/api-client-react";

export function useChatStream(conversationId: number) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");

  const sendMessage = useCallback(
    async (body: { content: string }) => {
      if (!conversationId) return;

      setIsStreaming(true);
      setStreamedContent("");

      try {
        const res = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error("Failed to send message");
        if (!res.body) throw new Error("No readable stream received");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let accumulatedText = "";

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const dataStr = line.replace("data: ", "").trim();
                if (!dataStr) continue;
                
                try {
                  const data = JSON.parse(dataStr);
                  if (data.done) {
                    done = true;
                  } else if (data.content) {
                    accumulatedText += data.content;
                    setStreamedContent(accumulatedText);
                  }
                } catch (e) {
                  // Ignore incomplete JSON chunks from split boundaries
                }
              }
            }
          }
          
          if (readerDone) {
            done = true;
          }
        }
      } catch (error) {
        console.error("Stream error:", error);
      } finally {
        setIsStreaming(false);
        // Invalidate the message list so it fetches the final persisted messages (user + AI)
        queryClient.invalidateQueries({
          queryKey: getListOpenaiMessagesQueryKey(conversationId),
        });
      }
    },
    [conversationId, queryClient]
  );

  return { sendMessage, isStreaming, streamedContent };
}
