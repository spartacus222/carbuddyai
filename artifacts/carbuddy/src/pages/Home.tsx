import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { Sparkles, Car, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { 
  useListOpenaiConversations, 
  useCreateOpenaiConversation,
  getListOpenaiConversationsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Home() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: conversations, isLoading } = useListOpenaiConversations();
  
  const createMutation = useCreateOpenaiConversation({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        setLocation(`/c/${data.id}`);
      }
    }
  });

  // Redirect to latest conversation if exists
  useEffect(() => {
    if (!isLoading && conversations && conversations.length > 0) {
      // Sort by ID descending assuming higher ID is newer
      const latest = [...conversations].sort((a, b) => b.id - a.id)[0];
      setLocation(`/c/${latest.id}`);
    }
  }, [conversations, isLoading, setLocation]);

  const startWithPrompt = (prompt: string) => {
    // In a real app we'd pass the initial prompt, here we just create a generic session
    // and the chat session page will let them type it.
    createMutation.mutate({ data: { title: prompt.substring(0, 30) + "..." } });
  };

  const prompts = [
    { text: "Find a reliable SUV under $35k", icon: Car, color: "text-blue-400" },
    { text: "Is the 2024 Tacoma a good deal?", icon: Search, color: "text-amber-400" },
    { text: "Best EV options for commuting", icon: Zap, color: "text-emerald-400" },
  ];

  if (isLoading || (conversations && conversations.length > 0)) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      <Sidebar />
      
      <main className="flex-1 relative flex flex-col items-center justify-center px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="relative z-10 w-full max-w-2xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-2xl shadow-primary/20 mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Meet your personal<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              car buying assistant
            </span>
          </h1>
          
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            Search live inventory, compare models, and get expert market pricing analysis instantly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            {prompts.map((p, i) => (
              <button
                key={i}
                onClick={() => startWithPrompt(p.text)}
                disabled={createMutation.isPending}
                className="group p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20 transition-all text-left flex flex-col gap-3 backdrop-blur-sm"
              >
                <div className={`p-2 rounded-lg bg-white/5 w-fit ${p.color}`}>
                  <p.icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-white/80 group-hover:text-white font-medium">
                  "{p.text}"
                </span>
              </button>
            ))}
          </div>

          <div className="pt-6">
            <Button 
              size="lg" 
              onClick={() => createMutation.mutate({ data: { title: "New Conversation" } })}
              disabled={createMutation.isPending}
              className="rounded-full px-8 text-base shadow-xl shadow-primary/20 h-12"
            >
              Start Chatting
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
