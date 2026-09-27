import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAsyncData from "./useAsyncData";
import * as vehiclesApi from "../api/vehicles.api";

export const useVehicles = (params) => {
  const loader = useCallback(
    () => vehiclesApi.getVehicles(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(["vehicles", params], loader, "Couldn't load vehicles.");
};

export const useVehicleTable = (params) => {
  const loader = useCallback(
    () => vehiclesApi.getVehicleTable(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["vehicles", "table", params],
    loader,
    "Couldn't load vehicles.",
  );
};

export const useVehicle = (id) => {
  const loader = useCallback(() => vehiclesApi.getVehicleById(id), [id]);
  return useAsyncData(["vehicle", id], loader, "Couldn't load vehicle.", {
    enabled: !!id,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vehiclesApi.createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => vehiclesApi.updateVehicle(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", variables.id] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vehiclesApi.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

export const useDealerVehicleSummary = () => {
  const loader = useCallback(() => vehiclesApi.getDealerVehicleSummary(), []);
  return useAsyncData(
    ["vehicles", "dealer-summary"],
    loader,
    "Couldn't load dealer vehicle summary.",
  );
};
