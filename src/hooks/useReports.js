import { useCallback } from "react";
import useAsyncData from "./useAsyncData";
import * as reportsApi from "../api/reports.api";

export const useVehicleReports = (params) => {
  const loader = useCallback(
    () => reportsApi.getVehicleReports(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["reports", "vehicles", params],
    loader,
    "Couldn't load vehicle reports.",
  );
};

export const useCustomerReports = (params) => {
  const loader = useCallback(
    () => reportsApi.getCustomerReports(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["reports", "customers", params],
    loader,
    "Couldn't load customer reports.",
  );
};

export const useDealerReports = (params) => {
  const loader = useCallback(
    () => reportsApi.getDealerReports(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["reports", "dealers", params],
    loader,
    "Couldn't load dealer reports.",
  );
};
