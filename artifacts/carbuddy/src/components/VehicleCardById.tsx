import React from "react";
import { useGetVehicle } from "@workspace/api-client-react";
import { VehicleMiniCard } from "./VehicleMiniCard";

interface VehicleCardByIdProps {
  vehicleId: number;
  reason?: string;
}

export function VehicleCardById({ vehicleId, reason }: VehicleCardByIdProps) {
  const { data: vehicle, isLoading, isError } = useGetVehicle(vehicleId);

  if (isLoading) {
    return (
      <div className="rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.07] h-48 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !vehicle) {
    return null;
  }

  return (
    <div>
      {reason && (
        <p className="text-[11px] text-white/40 mb-1.5 px-1">
          {reason}
        </p>
      )}
      <VehicleMiniCard vehicle={vehicle} />
    </div>
  );
}
