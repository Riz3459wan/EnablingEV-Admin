import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAsyncData from "./useAsyncData";
import * as ordersApi from "../api/orders.api";

// ── READ ──
export const useOrders = (params) => {
  const loader = useCallback(
    () => ordersApi.getOrders(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(["orders", params], loader, "Couldn't load orders.");
};

export const useOrdersFromQuotationTable = (params) => {
  const loader = useCallback(
    () => ordersApi.getOrdersFromQuotationTable(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["orders", "quotationTable", params],
    loader,
    "Couldn't load orders.",
  );
};

export const useOrder = (id) => {
  const loader = useCallback(() => ordersApi.getOrderById(id), [id]);
  return useAsyncData(["order", id], loader, "Couldn't load order.", {
    enabled: !!id,
  });
};

// ── CREATE / UPDATE / DELETE ──
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => ordersApi.updateOrder(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// ── ADMIN WORKFLOW ACTIONS ──
export const useApproveOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.approveOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useRejectOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => ordersApi.rejectOrder(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useMoveToBilling = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.moveToBilling,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useMarkBilled = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => ordersApi.markBilled(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useMoveToDispatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.moveToDispatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useDispatchOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => ordersApi.dispatchOrder(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useMarkOrderDelivered = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.markOrderDelivered,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
