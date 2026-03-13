import React from "react";
import { Building2, Car, List, MessageSquare, Plus, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useListOpenaiConversations, 
  useCreateOpenaiConversation,
  useDeleteOpenaiConversation,
  getListOpenaiConversationsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: conversations } = useListOpenaiConversations();
  
  const createMutation = useCreateOpenaiConversation({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        setLocation(`/c/${data.id}`);
      }
    }
  });

  const deleteMutation = useDeleteOpenaiConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        setLocation('/');
      }
    }
  });

  const handleNewChat = () => {
    createMutation.mutate({ data: { title: "New Conversation" } });
  };

  return (
    <div 
      className="hidden md:flex relative z-20 w-[260px] flex-shrink-0 flex-col h-full shadow-2xl"
      style={{
        background: "rgba(10, 14, 26, 0.4)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(30px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/[0.04]">
        <div 
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{ background: "linear-gradient(135deg, #3b82f6, #4f46e5)" }}
        >
          <Car className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-[17px] tracking-tight text-white">CarBuddy</span>
        <Badge variant="glass" className="ml-auto text-[9px] px-1.5 py-0 h-[18px] bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
          AI
        </Badge>
      </div>

      {/* New Chat Action */}
      <div className="p-4">
        <Button 
          onClick={handleNewChat}
          disabled={createMutation.isPending}
          className="w-full justify-start gap-2 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white/90 h-11"
        >
          <Plus className="w-4 h-4" />
          {createMutation.isPending ? "Starting..." : "New Conversation"}
        </Button>
      </div>

      {/* Nav Links */}
      <div className="px-3 pb-2 space-y-1">
        <Link
          href="/dealers"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
            location === "/dealers"
              ? "bg-primary/10 text-white font-medium border-l-2 border-primary pl-[10px]"
              : "text-white/60 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <Building2 className="w-4 h-4 opacity-60" />
          <span>Dealer Database</span>
        </Link>
        <Link
          href="/listings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
            location === "/listings"
              ? "bg-emerald-500/10 text-white font-medium border-l-2 border-emerald-500 pl-[10px]"
              : "text-white/60 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <List className="w-4 h-4 opacity-60" />
          <span>Vehicle Listings</span>
        </Link>
      </div>

      {/* History */}
      <ScrollArea className="flex-1 px-3">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white/30">
          History
        </div>
        <div className="space-y-1 pb-4">
          {conversations?.map((conv) => (
            <div key={conv.id} className="group relative flex items-center">
              <Link 
                href={`/c/${conv.id}`}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  location === `/c/${conv.id}`
                    ? "bg-primary/10 text-white font-medium border-l-2 border-primary pl-[10px]"
                    : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <MessageSquare className="w-4 h-4 opacity-50" />
                <span className="truncate pr-6">{conv.title}</span>
              </Link>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  deleteMutation.mutate({ id: conv.id });
                }}
                className="absolute right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {conversations?.length === 0 && (
            <div className="px-3 py-4 text-xs text-white/30 text-center">
              No previous chats
            </div>
          )}
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t border-white/[0.04] bg-white/[0.01]">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors">
          <Avatar className="w-8 h-8 border border-white/10">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-[10px] text-white font-bold">
              ME
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white/90 truncate">Guest User</p>
            <p className="text-[11px] text-white/40 truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
