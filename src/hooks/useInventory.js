import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAsyncData from "./useAsyncData";
import * as inventoryApi from "../api/inventory.api";

export const useInventory = (params) => {
  const loader = useCallback(
    () => inventoryApi.getInventory(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["inventory", params],
    loader,
    "Couldn't load inventory.",
  );
};

export const useInventorySummary = () => {
  const loader = useCallback(() => inventoryApi.getInventorySummary(), []);
  return useAsyncData(
    ["inventory", "summary"],
    loader,
    "Couldn't load inventory summary.",
  );
};

export const useInventoryBreakdown = (params) => {
  const loader = useCallback(
    () => inventoryApi.getInventoryBreakdown(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );
  return useAsyncData(
    ["inventory", "breakdown", params],
    loader,
    "Couldn't load inventory breakdown.",
    { enabled: !!params },
  );
};

export const useInventoryItem = (id) => {
  const loader = useCallback(() => inventoryApi.getInventoryById(id), [id]);
  return useAsyncData(
    ["inventory", id],
    loader,
    "Couldn't load inventory item.",
    { enabled: !!id },
  );
};

export const useCreateInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => inventoryApi.updateInventory(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", variables.id] });
    },
  });
};

export const useDeleteInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.deleteInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};
