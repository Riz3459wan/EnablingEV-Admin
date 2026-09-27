import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAsyncData from "./useAsyncData";
import * as customersApi from "../api/customers.api";

export const useCustomers = (params) => {
  const loader = useCallback(
    () => customersApi.getCustomers(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["customers", params],
    loader,
    "Couldn't load customers.",
  );
};

export const useCustomersAdmin = (params) => {
  const loader = useCallback(
    () => customersApi.getCustomersAdmin(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["customers", "admin", params],
    loader,
    "Couldn't load customers.",
  );
};

export const useCustomer = (id) => {
  const loader = useCallback(() => customersApi.getCustomerById(id), [id]);
  return useAsyncData(["customer", id], loader, "Couldn't load customer.", {
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customersApi.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => customersApi.updateCustomer(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", variables.id] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customersApi.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
