import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAsyncData from "./useAsyncData";
import * as dispatchApi from "../api/dispatch.api";

export const useDispatches = (params) => {
  const loader = useCallback(
    () => dispatchApi.getDispatches(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["dispatches", params],
    loader,
    "Couldn't load dispatches.",
  );
};

export const useDispatch = (id) => {
  const loader = useCallback(() => dispatchApi.getDispatchById(id), [id]);
  return useAsyncData(["dispatch", id], loader, "Couldn't load dispatch.", {
    enabled: !!id,
  });
};

export const useCreateDispatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dispatchApi.createDispatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatches"] });
    },
  });
};

export const useUpdateDispatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => dispatchApi.updateDispatch(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch", variables.id] });
    },
  });
};

export const useDeleteDispatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dispatchApi.deleteDispatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatches"] });
    },
  });
};
