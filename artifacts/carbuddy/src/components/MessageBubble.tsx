import React from "react";
import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { VehicleCardById } from "./VehicleCardById";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  const renderContent = () => {
    const parts = content.split(/(```json\n[\s\S]*?\n```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```json")) {
        try {
          const jsonStr = part.replace(/```json\n/, "").replace(/\n```/, "");
          const data = JSON.parse(jsonStr);

          if (data.vehicles && Array.isArray(data.vehicles)) {
            return (
              <div key={index} className="space-y-3 my-3 not-prose">
                {data.vehicles.map((v: { id: number; reason?: string }) => (
                  <VehicleCardById key={v.id} vehicleId={v.id} reason={v.reason} />
                ))}
              </div>
            );
          }
        } catch {
          return (
            <pre
              key={index}
              className="bg-black/40 p-3 rounded-xl border border-white/[0.08] overflow-x-auto text-xs my-3 text-white/60"
            >
              <code>{part}</code>
            </pre>
          );
        }
      }

      if (!part.trim()) return null;

      return (
        <div
          key={index}
          className={`prose-ai ${isStreaming && index === parts.length - 1 ? "typing-cursor" : ""}`}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{part}</ReactMarkdown>
        </div>
      );
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end animate-in fade-in slide-in-from-bottom-1 duration-200">
        <div
          className="px-4 py-3 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed max-w-[78%] text-white"
          style={{
            background: "linear-gradient(135deg, #2563eb, #4f46e5)",
            boxShadow: "0 4px 20px rgba(59,130,246,0.2)",
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md"
        style={{
          background: "linear-gradient(135deg, #1d4ed8, #4338ca)",
          boxShadow: "0 0 16px rgba(99,102,241,0.25)",
        }}
      >
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="rounded-2xl rounded-tl-sm px-5 py-4 text-[15px] text-white/80 leading-relaxed"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
