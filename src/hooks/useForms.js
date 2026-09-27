import { useCallback } from "react";
import useAsyncData from "./useAsyncData";
import * as formsApi from "../api/forms.api";

export const useKnownChassis = (params) => {
  const loader = useCallback(
    () => formsApi.getKnownChassis(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );

  return useAsyncData(
    ["forms", "chassis", params],
    loader,
    "Couldn't load chassis numbers.",
  );
};
