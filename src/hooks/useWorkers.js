import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAsyncData from "./useAsyncData";
import * as workersApi from "../api/workers.api";

export const useWorkers = (params) => {
  const loader = useCallback(
    () => workersApi.getWorkers(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(["workers", params], loader, "Couldn't load workers.");
};

export const useWorker = (id) => {
  const loader = useCallback(() => workersApi.getWorkerById(id), [id]);
  return useAsyncData(["worker", id], loader, "Couldn't load worker.", {
    enabled: !!id,
  });
};

export const useCreateWorker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: workersApi.createWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
  });
};

export const useUpdateWorker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => workersApi.updateWorker(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      queryClient.invalidateQueries({ queryKey: ["worker", variables.id] });
    },
  });
};

export const useDeleteWorker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: workersApi.deleteWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
  });
};
