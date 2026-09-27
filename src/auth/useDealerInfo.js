import { useMemo } from "react";
import { useLocation } from "react-router";

// Safely read the logged-in dealer's profile that DealerLogin / DealerActivate
// stored in localStorage. Old app also tolerated the literal strings
// "undefined" / "null" (written when the API returned no dealer object).
export const readDealerInfo = () => {
  const raw = localStorage.getItem("dealerInfo");
  if (!raw || raw === "undefined" || raw === "null") return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

// Returns { dealerInfo, dealerCode }.
// dealerCode comes from localStorage first (survives refresh), and falls back
// to router state (old app relied on router state only, which was lost on refresh).
export const useDealerInfo = () => {
  const location = useLocation();
  const dealerInfo = useMemo(() => readDealerInfo(), []);
  const dealerCode = dealerInfo?.dealerCode || location.state?.dealerCode || "";
  return { dealerInfo, dealerCode };
};

export default useDealerInfo;
