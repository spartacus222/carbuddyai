import React from "react";
import { 
  Heart, MapPin, Star, Gauge, Users, Briefcase, ChevronRight, TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function VehicleCards() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-sans p-8 flex items-center justify-center overflow-x-auto">
      
      <div className="flex gap-6 items-stretch">
        
        {/* Detailed Card 1 */}
        <div className="w-[300px] bg-[#16191f] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col group hover:border-blue-500/30 transition-all duration-300">
          {/* Image Header */}
          <div className="h-[180px] relative bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
            <img 
              src="/images/rav4.png" 
              alt="Toyota RAV4" 
              className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#16191f] via-transparent to-transparent"></div>
            
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-blue-600 hover:bg-blue-700 text-xs px-2.5 py-0.5 border-0 shadow-lg font-medium tracking-wide">
                Best Match
              </Badge>
            </div>

            {/* Match Circle */}
            <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
               <svg className="w-10 h-10 absolute inset-0 -rotate-90">
                 <circle cx="20" cy="20" r="16" className="stroke-white/10" strokeWidth="3" fill="none" />
                 <circle cx="20" cy="20" r="16" className="stroke-blue-500" strokeWidth="3" fill="none" strokeDasharray="100" strokeDashoffset="6" />
               </svg>
               <span className="text-[10px] font-bold text-white relative z-10">94%</span>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <div className="mb-1 text-[11px] font-medium text-white/50 tracking-wider uppercase">Toyota</div>
            <h3 className="font-semibold text-lg text-white mb-1 leading-tight">2024 RAV4 XLE</h3>
            <div className="text-sm text-white/60 mb-3">12,400 mi • Clean Title</div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-blue-400">$29,800</span>
              <span className="text-xs text-white/50 line-through">$31,500</span>
            </div>

            {/* Price Indicator */}
            <div className="bg-[#1e222b] rounded-lg p-2.5 mb-4 border border-emerald-500/20">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Great Price ($1.7k below market)</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-[40%] bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-[#1e222b] rounded-md py-2 px-1 flex flex-col items-center justify-center text-center border border-white/5">
                <Gauge className="w-3.5 h-3.5 text-white/40 mb-1" />
                <span className="text-[10px] text-white/70">37 MPG</span>
              </div>
              <div className="bg-[#1e222b] rounded-md py-2 px-1 flex flex-col items-center justify-center text-center border border-white/5">
                <Users className="w-3.5 h-3.5 text-white/40 mb-1" />
                <span className="text-[10px] text-white/70">5 Seats</span>
              </div>
              <div className="bg-[#1e222b] rounded-md py-2 px-1 flex flex-col items-center justify-center text-center border border-white/5">
                <Briefcase className="w-3.5 h-3.5 text-white/40 mb-1" />
                <span className="text-[10px] text-white/70">37.6 ft³</span>
              </div>
            </div>

            <Separator className="bg-white/10 mb-4" />

            {/* Dealer Info */}
            <div className="flex items-center gap-3 mb-5 mt-auto">
              <div className="w-8 h-8 rounded bg-[#1e222b] border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                SF
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/90 truncate">SF Toyota Center</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-medium text-amber-400">4.8</span>
                  </div>
                  <span className="text-[10px] text-white/40">• 4.2 mi away</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2">
                <Heart className="w-4 h-4" />
                Save
              </Button>
              <Button className="h-10 bg-blue-600 hover:bg-blue-700 text-white">
                Contact
              </Button>
            </div>
          </div>
        </div>

        {/* Detailed Card 2 */}
        <div className="w-[300px] bg-[#16191f] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col group hover:border-emerald-500/30 transition-all duration-300">
          {/* Image Header */}
          <div className="h-[180px] relative bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
            <img 
              src="/images/crv.png" 
              alt="Honda CR-V" 
              className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#16191f] via-transparent to-transparent"></div>
            
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-xs px-2.5 py-0.5 border-0 shadow-lg font-medium tracking-wide">
                #1 Reliability
              </Badge>
            </div>

            {/* Match Circle */}
            <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
               <svg className="w-10 h-10 absolute inset-0 -rotate-90">
                 <circle cx="20" cy="20" r="16" className="stroke-white/10" strokeWidth="3" fill="none" />
                 <circle cx="20" cy="20" r="16" className="stroke-emerald-500" strokeWidth="3" fill="none" strokeDasharray="100" strokeDashoffset="12" />
               </svg>
               <span className="text-[10px] font-bold text-white relative z-10">88%</span>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <div className="mb-1 text-[11px] font-medium text-white/50 tracking-wider uppercase">Honda</div>
            <h3 className="font-semibold text-lg text-white mb-1 leading-tight">2024 CR-V EX</h3>
            <div className="text-sm text-white/60 mb-3">5,200 mi • Certified Pre-Owned</div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-emerald-400">$30,850</span>
              <span className="text-xs text-white/50">Fair price</span>
            </div>

            {/* Price Indicator */}
            <div className="bg-[#1e222b] rounded-lg p-2.5 mb-4 border border-white/10">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs font-medium text-white/70">Average Market Price</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-[60%] bg-white/40 rounded-full"></div>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-[#1e222b] rounded-md py-2 px-1 flex flex-col items-center justify-center text-center border border-white/5">
                <Gauge className="w-3.5 h-3.5 text-white/40 mb-1" />
                <span className="text-[10px] text-white/70">34 MPG</span>
              </div>
              <div className="bg-[#1e222b] rounded-md py-2 px-1 flex flex-col items-center justify-center text-center border border-white/5">
                <Users className="w-3.5 h-3.5 text-white/40 mb-1" />
                <span className="text-[10px] text-white/70">5 Seats</span>
              </div>
              <div className="bg-[#1e222b] rounded-md py-2 px-1 flex flex-col items-center justify-center text-center border border-white/5">
                <Briefcase className="w-3.5 h-3.5 text-white/40 mb-1" />
                <span className="text-[10px] text-white/70">39.3 ft³</span>
              </div>
            </div>

            <Separator className="bg-white/10 mb-4" />

            {/* Dealer Info */}
            <div className="flex items-center gap-3 mb-5 mt-auto">
              <div className="w-8 h-8 rounded bg-[#1e222b] border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                HM
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/90 truncate">Honda Marin</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-medium text-amber-400">4.5</span>
                  </div>
                  <span className="text-[10px] text-white/40">• 12.8 mi away</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2">
                <Heart className="w-4 h-4" />
                Save
              </Button>
              <Button className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white">
                Contact
              </Button>
            </div>
          </div>
        </div>

        {/* Detailed Card 3 */}
        <div className="w-[300px] bg-[#16191f] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col group hover:border-amber-500/30 transition-all duration-300">
          {/* Image Header */}
          <div className="h-[180px] relative bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
            <img 
              src="/images/outback.png" 
              alt="Subaru Outback" 
              className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#16191f] via-transparent to-transparent"></div>
            
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-amber-600 hover:bg-amber-700 text-xs px-2.5 py-0.5 border-0 shadow-lg font-medium tracking-wide">
                Great Value
              </Badge>
            </div>

            {/* Match Circle */}
            <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
               <svg className="w-10 h-10 absolute inset-0 -rotate-90">
                 <circle cx="20" cy="20" r="16" className="stroke-white/10" strokeWidth="3" fill="none" />
                 <circle cx="20" cy="20" r="16" className="stroke-amber-500" strokeWidth="3" fill="none" strokeDasharray="100" strokeDashoffset="24" />
               </svg>
               <span className="text-[10px] font-bold text-white relative z-10">76%</span>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <div className="mb-1 text-[11px] font-medium text-white/50 tracking-wider uppercase">Subaru</div>
            <h3 className="font-semibold text-lg text-white mb-1 leading-tight">2024 Outback Premium</h3>
            <div className="text-sm text-white/60 mb-3">18,100 mi • Clean Title</div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-amber-400">$28,895</span>
              <span className="text-xs text-white/50 line-through">$30,200</span>
            </div>

            {/* Price Indicator */}
            <div className="bg-[#1e222b] rounded-lg p-2.5 mb-4 border border-emerald-500/20">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Good Price ($1.3k below)</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-[45%] bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-[#1e222b] rounded-md py-2 px-1 flex flex-col items-center justify-center text-center border border-white/5">
                <Gauge className="w-3.5 h-3.5 text-white/40 mb-1" />
                <span className="text-[10px] text-white/70">32 MPG</span>
              </div>
              <div className="bg-[#1e222b] rounded-md py-2 px-1 flex flex-col items-center justify-center text-center border border-white/5">
                <Users className="w-3.5 h-3.5 text-white/40 mb-1" />
                <span className="text-[10px] text-white/70">5 Seats</span>
              </div>
              <div className="bg-[#1e222b] rounded-md py-2 px-1 flex flex-col items-center justify-center text-center border border-white/5">
                <Briefcase className="w-3.5 h-3.5 text-white/40 mb-1" />
                <span className="text-[10px] text-white/70">32.6 ft³</span>
              </div>
            </div>

            <Separator className="bg-white/10 mb-4" />

            {/* Dealer Info */}
            <div className="flex items-center gap-3 mb-5 mt-auto">
              <div className="w-8 h-8 rounded bg-[#1e222b] border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                SD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/90 truncate">Serramonte Direct</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-medium text-amber-400">4.1</span>
                  </div>
                  <span className="text-[10px] text-white/40">• 8.5 mi away</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2">
                <Heart className="w-4 h-4" />
                Save
              </Button>
              <Button className="h-10 bg-amber-600 hover:bg-amber-700 text-white">
                Contact
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
