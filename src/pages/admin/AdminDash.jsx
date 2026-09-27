import DashboardHeader from "../../components/dashboard/DashboardHeader";
import ActionRequiredWidget from "../../components/dashboard/ActionRequiredWidget";
import VehiclesSection from "../../components/dashboard/VehiclesSection";
import DealersSection from "../../components/dashboard/DealersSection";
import SalesSection from "../../components/dashboard/SalesSection";
import { LoadingCard, ErrorCard } from "../../components/ui/AsyncStates";
import { useInventorySummary } from "../../hooks/useInventory";
import { useDealersSummary } from "../../hooks/useDealers";
import { useOrders } from "../../hooks/useOrders";
import { usePendingDealerRequests } from "../../hooks/useDealers";

const toArray = (v) => (Array.isArray(v) ? v : []);

const AdminDash = () => {
  const { data: inventorySummary } = useInventorySummary();
  const { data: dealersSummary } = useDealersSummary();
  const { data: ordersData, loading, error } = useOrders();
  const { data: dealerRequestsData } = usePendingDealerRequests();

  const vehicles = inventorySummary ?? null;
  const dealers = dealersSummary ?? null;
  const orders = toArray(ordersData);
  const dealerRequests = toArray(dealerRequestsData);

  const pendingOrders = orders.filter(
    (o) => o.status === "Pending Approval",
  ).length;

  const billingInProgress = orders.filter(
    (o) => o.status === "Billing in Progress",
  ).length;

  const readyToDispatch = orders.filter(
    (o) => o.status === "Ready to Dispatch",
  ).length;

  const dispatchedCount = orders.filter(
    (o) => o.status === "Dispatched",
  ).length;

  const pendingDealerRequests = dealerRequests.length;

  if (loading) return <LoadingCard rows={6} />;
  if (error) return <ErrorCard message={error} />;

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      <DashboardHeader />

      <ActionRequiredWidget
        pendingOrders={pendingOrders}
        billingInProgress={billingInProgress}
        readyToDispatch={readyToDispatch}
        dispatched={dispatchedCount}
        pendingDealerRequests={pendingDealerRequests}
      />

      <VehiclesSection vehicles={vehicles} />

      <DealersSection dealers={dealers} />

      <SalesSection />
    </div>
  );
};

export default AdminDash;
