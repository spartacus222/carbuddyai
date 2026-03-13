import React from "react";
import { 
  Car, MessageSquare, Plus, MapPin, 
  User, Send, Heart, ChevronRight, 
  Menu, Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MobileChat() {
  return (
    <div className="min-h-screen bg-[#16191f] text-white font-sans flex flex-col mx-auto max-w-[390px] w-full shadow-2xl relative overflow-hidden outline outline-1 outline-white/10 h-[844px]">
      
      {/* Header */}
      <header className="h-14 flex-shrink-0 border-b border-white/10 flex items-center justify-between px-4 bg-[#16191f]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 text-white/70 hover:text-white">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <Car className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">CarBuddy</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white rounded-full bg-white/5">
          <MapPin className="w-4 h-4" />
        </Button>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1 px-4 py-4 z-0">
        <div className="space-y-6 pb-40">
          
          {/* AI Intro */}
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Car className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="bg-[#1e222b] rounded-2xl rounded-tl-sm p-3.5 text-white/90 text-sm leading-relaxed shadow-md">
                Hi Jordan! I'm CarBuddy. I can help you find, compare, or buy your next car. What are you looking for today?
              </div>
            </div>
          </div>

          {/* User Message */}
          <div className="flex justify-end">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md">
              <p className="text-[14px] leading-relaxed">
                I'm looking for a reliable SUV under $35,000. I have 2 kids and need good cargo space.
              </p>
            </div>
          </div>

          {/* AI Response with Carousel */}
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Car className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="flex-1 w-full min-w-0">
              <div className="bg-[#1e222b] rounded-2xl rounded-tl-sm p-3.5 text-white/90 text-sm leading-relaxed shadow-md mb-3">
                Based on your budget of $35k and need for family space, here are my top 3 recommendations that fit perfectly:
              </div>
              
              {/* Horizontal Scroll Cards */}
              <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
                
                {/* Mobile Card 1 */}
                <div className="bg-[#252a36] rounded-xl overflow-hidden border border-white/10 flex-shrink-0 w-[240px] snap-center shadow-lg">
                  <div className="h-32 relative bg-gradient-to-br from-slate-700 to-slate-900">
                    <img src="/images/rav4.png" alt="RAV4" className="w-full h-full object-cover mix-blend-luminosity opacity-90" />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-600 text-[10px] px-1.5 py-0 border-0 shadow-sm">Best Match</Badge>
                    </div>
                    <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm">2024 Toyota RAV4</h4>
                    <div className="text-blue-400 font-medium text-sm mt-0.5">$29,825</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 px-1 py-0 rounded">37 MPG</Badge>
                      <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 px-1 py-0 rounded">37.6 cu ft</Badge>
                    </div>
                  </div>
                </div>

                {/* Mobile Card 2 */}
                <div className="bg-[#252a36] rounded-xl overflow-hidden border border-white/10 flex-shrink-0 w-[240px] snap-center shadow-lg">
                  <div className="h-32 relative bg-gradient-to-br from-slate-800 to-slate-900">
                    <img src="/images/crv.png" alt="CR-V" className="w-full h-full object-cover mix-blend-luminosity opacity-90" />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-emerald-600 text-[10px] px-1.5 py-0 border-0 shadow-sm">Most Reliable</Badge>
                    </div>
                    <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm">2024 Honda CR-V</h4>
                    <div className="text-emerald-400 font-medium text-sm mt-0.5">$30,850</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 px-1 py-0 rounded">More Space</Badge>
                      <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 px-1 py-0 rounded">Top Safety</Badge>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="flex justify-center gap-1.5 mt-[-4px]">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
              </div>

            </div>
          </div>
          
        </div>
      </ScrollArea>

      {/* Sticky Bottom Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#16191f] via-[#16191f] to-transparent pt-6 pb-safe z-20">
        <div className="px-4 pb-4">
          
          {/* Scrollable Action Chips */}
          <div className="flex overflow-x-auto gap-2 pb-3 -mx-4 px-4 scrollbar-hide">
            {["Compare specs", "Find dealers", "Calculate loan", "Safety ratings"].map((chip, i) => (
              <button key={i} className="whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium border border-white/10 bg-[#1e222b] text-white/80 active:bg-white/10 transition-colors shadow-sm">
                {chip}
              </button>
            ))}
          </div>

          {/* Input Field */}
          <div className="relative bg-[#1e222b] border border-white/10 rounded-full flex items-center p-1 shadow-lg shadow-black/20">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/50 hover:text-white rounded-full shrink-0">
              <Plus className="w-5 h-5" />
            </Button>
            <input 
              type="text"
              className="flex-1 bg-transparent border-0 outline-none px-2 text-[14px] text-white placeholder:text-white/40 h-9"
              placeholder="Message CarBuddy..."
            />
            <div className="flex items-center gap-1 pr-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-white/50 hover:text-white rounded-full">
                <Mic className="w-4 h-4" />
              </Button>
              <Button className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center p-0">
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
}
