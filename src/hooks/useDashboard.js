import { useCallback } from "react";
import useAsyncData from "./useAsyncData";
import * as dashboardApi from "../api/dashboard.api";

export const useDashboard = () => {
  const loader = useCallback(() => dashboardApi.getDashboard(), []);
  return useAsyncData(["dashboard"], loader, "Couldn't load dashboard data.");
};

export const useDashboardVehicles = () => {
  const loader = useCallback(() => dashboardApi.getDashboardVehicles(), []);
  return useAsyncData(
    ["dashboard", "vehicles"],
    loader,
    "Couldn't load vehicles data.",
  );
};

export const useDashboardDealers = () => {
  const loader = useCallback(() => dashboardApi.getDashboardDealers(), []);
  return useAsyncData(
    ["dashboard", "dealers"],
    loader,
    "Couldn't load dealers data.",
  );
};

export const useDashboardSales = () => {
  const loader = useCallback(() => dashboardApi.getDashboardSales(), []);
  return useAsyncData(
    ["dashboard", "sales"],
    loader,
    "Couldn't load sales data.",
  );
};
