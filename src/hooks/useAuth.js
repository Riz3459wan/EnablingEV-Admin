import { useMutation } from "@tanstack/react-query";
import * as authApi from "../api/auth.api";

export const useLoginMutation = () =>
  useMutation({ mutationFn: authApi.login });

export const useLogoutMutation = () =>
  useMutation({ mutationFn: authApi.logout });

export const useChangePassword = () =>
  useMutation({ mutationFn: authApi.changePassword });
