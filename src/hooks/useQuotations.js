import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAsyncData from "./useAsyncData";
import * as quotationsApi from "../api/quotations.api";

export const useQuotations = (params) => {
  const loader = useCallback(
    () => quotationsApi.getQuotations(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["quotations", params],
    loader,
    "Couldn't load quotations.",
  );
};

export const useQuotationsFromTable = (params) => {
  const loader = useCallback(
    () => quotationsApi.getQuotationsFromTable(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["quotations", "table", params],
    loader,
    "Couldn't load quotations.",
  );
};

export const useQuotation = (id) => {
  const loader = useCallback(() => quotationsApi.getQuotationById(id), [id]);
  return useAsyncData(["quotation", id], loader, "Couldn't load quotation.", {
    enabled: !!id,
  });
};

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotationsApi.createQuotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => quotationsApi.updateQuotation(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", variables.id] });
    },
  });
};

export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotationsApi.deleteQuotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
};
