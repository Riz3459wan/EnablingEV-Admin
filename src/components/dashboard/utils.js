// ═══════════════════════════════════════════════════════════
//  DASHBOARD UTILS
// ═══════════════════════════════════════════════════════════

export const formatINR = (v) => {
  const n = Number(v) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
};

export const ORDER_STATUS_STYLES = {
  "Pending Approval": "bg-amber-50 text-amber-700 border-amber-200",
  "Assigned to Sub-Admin": "bg-blue-50 text-blue-700 border-blue-200",
  "Ready for Billing": "bg-purple-50 text-purple-700 border-purple-200",
  "Sent to Billing": "bg-orange-50 text-orange-700 border-orange-200",
  Billed: "bg-green-50 text-green-700 border-green-200",
};
