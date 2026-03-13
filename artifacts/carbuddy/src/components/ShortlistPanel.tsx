import React from "react";
import { Heart, X, MapPin, ExternalLink } from "lucide-react";
import { useGetShortlist, useRemoveFromShortlist, getGetShortlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ShortlistPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: shortlist, isLoading } = useGetShortlist();

  const removeMutation = useRemoveFromShortlist({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: getGetShortlistQueryKey() }),
    },
  });

  if (!isOpen) return null;

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: "rgba(8,11,20,0.97)",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(40px)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]"
        style={{ background: "rgba(255,255,255,0.015)" }}
      >
        <div className="flex items-center gap-2.5">
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400/25" />
          <span className="text-sm font-semibold text-white/90">My Shortlist</span>
          {(shortlist?.length ?? 0) > 0 && (
            <Badge
              variant="outline"
              className="text-[10px] py-0 px-1.5 border-rose-500/30 text-rose-300 bg-rose-500/10"
            >
              {shortlist!.length}
            </Badge>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : shortlist?.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-40"
                style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.2)" }}
              >
                <Heart className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-[13px] text-white/35 leading-relaxed">
                No vehicles saved yet.<br />
                Ask CarBuddy for recommendations.
              </p>
            </div>
          ) : (
            shortlist?.map((entry) => {
              const car = entry.vehicle;
              return (
                <div
                  key={entry.id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {/* Card image */}
                  <div className="relative h-28 bg-slate-900/50 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=300&fit=crop&q=80"
                      alt={car.model}
                      className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <button
                      onClick={() => removeMutation.mutate({ vehicleId: car.id })}
                      disabled={removeMutation.isPending}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-black/50 hover:bg-rose-500/30 border border-white/10 hover:border-rose-500/40 transition-all"
                    >
                      <X className="w-3 h-3 text-white/60 hover:text-white" />
                    </button>
                    <div className="absolute bottom-2 left-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/25">
                        {car.matchScore}% Match
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-3.5 py-3">
                    <p className="text-[13px] font-semibold text-white/90 leading-snug mb-0.5">
                      {car.year} {car.make} {car.model}
                    </p>
                    <p className="text-[11px] text-white/40 mb-2">{car.trim}</p>
                    <p className="text-[17px] font-bold text-white mb-3">
                      ${car.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-white/40 mb-3">
                      <span>{car.mpg > 0 ? `${car.mpg} MPG` : "EV"}</span>
                      <span>·</span>
                      <span>{car.mileage.toLocaleString()} mi</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {car.dealerDistance}mi
                      </span>
                    </div>
                    <Button variant="glass" className="w-full h-8 text-xs gap-1.5">
                      <ExternalLink className="w-3 h-3" />
                      Contact Dealer
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
