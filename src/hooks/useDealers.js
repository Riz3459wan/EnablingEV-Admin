import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAsyncData from "./useAsyncData";
import * as dealersApi from "../api/dealers.api";

export const useDealers = (params) => {
  const loader = useCallback(
    () => dealersApi.getDealers(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(["dealers", params], loader, "Couldn't load dealers.");
};

export const useDealersSummary = () => {
  const loader = useCallback(() => dealersApi.getDealersSummary(), []);
  return useAsyncData(
    ["dealers", "summary"],
    loader,
    "Couldn't load dealers summary.",
  );
};

export const useDealersBreakdown = (params) => {
  const loader = useCallback(
    () => dealersApi.getDealersBreakdown(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["dealers", "breakdown", params],
    loader,
    "Couldn't load dealers breakdown.",
    { enabled: !!params },
  );
};

export const useDealerFull = () => {
  const loader = useCallback(() => dealersApi.getDealerFull(), []);
  return useAsyncData(["dealers", "full"], loader, "Couldn't load dealers.");
};

export const useDealer = (id) => {
  const loader = useCallback(() => dealersApi.getDealerById(id), [id]);
  return useAsyncData(["dealer", id], loader, "Couldn't load dealer.", {
    enabled: !!id,
  });
};

export const useDealerDetails = (id) => {
  const loader = useCallback(() => dealersApi.getDealerDetails(id), [id]);
  return useAsyncData(
    ["dealerDetails", id],
    loader,
    "Couldn't load dealer details.",
    { enabled: !!id },
  );
};

export const useCreateDealer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dealersApi.createDealer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealers"] });
    },
  });
};

export const useUpdateDealer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => dealersApi.updateDealer(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dealers"] });
      queryClient.invalidateQueries({ queryKey: ["dealer", variables.id] });
    },
  });
};

export const useDeleteDealer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dealersApi.deleteDealer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealers"] });
    },
  });
};

export const usePendingDealerRequests = () => {
  const loader = useCallback(() => dealersApi.getPendingDealerRequests(), []);
  return useAsyncData(
    ["dealerRequests", "pending"],
    loader,
    "Couldn't load pending requests.",
  );
};

export const useApproveDealerRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dealersApi.approveDealerRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealerRequests"] });
    },
  });
};

export const useRejectDealerRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) =>
      dealersApi.rejectDealerRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealerRequests"] });
    },
  });
};
