import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAsyncData from "./useAsyncData";
import * as subadminsApi from "../api/subadmins.api";

export const useSubAdmins = (params) => {
  const loader = useCallback(
    () => subadminsApi.getSubAdmins(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["subadmins", params],
    loader,
    "Couldn't load sub-admins.",
  );
};

export const useSubAdmin = (id) => {
  const loader = useCallback(() => subadminsApi.getSubAdminById(id), [id]);
  return useAsyncData(["subadmin", id], loader, "Couldn't load sub-admin.", {
    enabled: !!id,
  });
};

export const useCreateSubAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subadminsApi.createSubAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subadmins"] });
    },
  });
};

export const useUpdateSubAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => subadminsApi.updateSubAdmin(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subadmins"] });
      queryClient.invalidateQueries({ queryKey: ["subadmin", variables.id] });
    },
  });
};

export const useDeleteSubAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subadminsApi.deleteSubAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subadmins"] });
    },
  });
};
