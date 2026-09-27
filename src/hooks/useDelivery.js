import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAsyncData from "./useAsyncData";
import * as deliveryApi from "../api/delivery.api";

export const useDeliveries = (params) => {
  const loader = useCallback(
    () => deliveryApi.getDeliveries(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["deliveries", params],
    loader,
    "Couldn't load deliveries.",
  );
};

export const useDelivery = (id) => {
  const loader = useCallback(() => deliveryApi.getDeliveryById(id), [id]);
  return useAsyncData(["delivery", id], loader, "Couldn't load delivery.", {
    enabled: !!id,
  });
};

export const useCreateDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deliveryApi.createDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    },
  });
};

export const useUpdateDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => deliveryApi.updateDelivery(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["delivery", variables.id] });
    },
  });
};

export const useDeleteDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deliveryApi.deleteDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    },
  });
};
