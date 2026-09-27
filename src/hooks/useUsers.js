import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAsyncData from "./useAsyncData";
import * as usersApi from "../api/users.api";

export const useUsers = (params) => {
  const loader = useCallback(
    () => usersApi.getUsers(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(["users", params], loader, "Couldn't load users.");
};

export const useUser = (id) => {
  const loader = useCallback(() => usersApi.getUserById(id), [id]);

  return useAsyncData(["user", id], loader, "Couldn't load user.", {
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => usersApi.updateUser(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
