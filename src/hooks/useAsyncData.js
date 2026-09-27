import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const unwrap = (response) => {
  if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response) &&
    "success" in response &&
    "data" in response
  ) {
    return response.data;
  }
  return response;
};

const useAsyncData = (
  queryKey,
  loader,
  errorMessage = "Couldn't load data.",
  options = {},
) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: async () => unwrap(await loader()),
    enabled: options.enabled !== false,
  });

  const reload = useCallback(() => query.refetch(), [query]);

  const setData = (updater) => {
    queryClient.setQueryData(queryKey, (old) =>
      typeof updater === "function" ? updater(old) : updater,
    );
  };

  return {
    data: query.data ?? null,
    error: query.isError
      ? query.error?.response?.data?.message || errorMessage
      : "",
    loading: query.isLoading,
    reload,
    setData,
  };
};

export default useAsyncData;
