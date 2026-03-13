import React from "react";
import { Heart, Gauge, Users, Briefcase, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@workspace/api-client-react";
import { useGetShortlist, useAddToShortlist, useRemoveFromShortlist, getGetShortlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export function VehicleMiniCard({ vehicle }: { vehicle: Vehicle }) {
  const queryClient = useQueryClient();
  const shortlistQuery = useGetShortlist();

  const addMutation = useAddToShortlist({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetShortlistQueryKey() }),
    },
  });

  const removeMutation = useRemoveFromShortlist({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetShortlistQueryKey() }),
    },
  });

  const isSaved = shortlistQuery.data?.some((e) => e.vehicleId === vehicle.id) ?? false;
  const isPending = addMutation.isPending || removeMutation.isPending;

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      removeMutation.mutate({ vehicleId: vehicle.id });
    } else {
      addMutation.mutate({ data: { vehicleId: vehicle.id } });
    }
  };

  let badgeColor = "#3b82f6";
  if (vehicle.badge?.toLowerCase().includes("value")) badgeColor = "#f59e0b";
  if (vehicle.badge?.toLowerCase().includes("reliab")) badgeColor = "#22c55e";

  const PriceIcon =
    vehicle.priceStatus === "below" ? TrendingDown : vehicle.priceStatus === "above" ? TrendingUp : Minus;
  const priceColor =
    vehicle.priceStatus === "below" ? "#22c55e" : vehicle.priceStatus === "above" ? "#ef4444" : "#94a3b8";

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Image strip */}
      <div className="relative h-40 bg-slate-900/60 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=400&fit=crop&q=80"
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/30 to-transparent" />

        {vehicle.badge && (
          <div className="absolute top-3 left-3">
            <span
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md"
              style={{
                background: `${badgeColor}22`,
                color: badgeColor,
                border: `1px solid ${badgeColor}55`,
              }}
            >
              {vehicle.badge}
            </span>
          </div>
        )}

        <button
          onClick={handleToggleSave}
          disabled={isPending}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all border ${
            isSaved
              ? "bg-rose-500/25 border-rose-500/50"
              : "bg-black/40 border-white/10 hover:bg-black/60"
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${isSaved ? "fill-rose-400 text-rose-400" : "text-white/70"}`}
          />
        </button>

        {/* Title + price inside image */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <p className="text-[13px] font-semibold text-white/90 drop-shadow-md">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
            <p className="text-[11px] text-white/50">{vehicle.trim}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-white drop-shadow-md">
              ${vehicle.price.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 justify-end">
              <PriceIcon className="w-3 h-3" style={{ color: priceColor }} />
              <span className="text-[10px]" style={{ color: priceColor }}>
                {Math.abs(vehicle.marketPriceDiff).toLocaleString()} vs market
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[12px] text-white/45">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 opacity-60" />
            {vehicle.mpg > 0 ? `${vehicle.mpg} MPG` : "EV"}
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 opacity-60" />
            {vehicle.seats} seats
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 opacity-60" />
            {vehicle.cargoSpace} ft³
          </span>
        </div>
        <Button
          variant="glass"
          className="h-7 px-3 text-[11px] font-medium"
          onClick={handleToggleSave}
          disabled={isPending}
        >
          {isSaved ? "Saved" : "Save"}
        </Button>
      </div>
    </div>
  );
}
