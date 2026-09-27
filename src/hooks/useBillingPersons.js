import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAsyncData from "./useAsyncData";
import * as billingApi from "../api/billing.api";

export const useBillingPersons = (params) => {
  const loader = useCallback(
    () => billingApi.getBillingPersons(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["billingPersons", params],
    loader,
    "Couldn't load billing persons.",
  );
};

export const useBillingPerson = (id) => {
  const loader = useCallback(() => billingApi.getBillingPersonById(id), [id]);
  return useAsyncData(
    ["billingPerson", id],
    loader,
    "Couldn't load billing person.",
    { enabled: !!id },
  );
};

export const useCreateBillingPerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: billingApi.createBillingPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billingPersons"] });
    },
  });
};

export const useUpdateBillingPerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) =>
      billingApi.updateBillingPerson(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billingPersons"] });
    },
  });
};

export const useDeleteBillingPerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: billingApi.deleteBillingPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billingPersons"] });
    },
  });
};
