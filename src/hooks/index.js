export { default as useAsyncData } from "./useAsyncData";

export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "./useUsers";

export {
  useSubAdmins,
  useSubAdmin,
  useCreateSubAdmin,
  useUpdateSubAdmin,
  useDeleteSubAdmin,
} from "./useSubAdmins";

export {
  useDealers,
  useDealerFull,
  useDealer,
  useDealerDetails,
  useDealersSummary,
  useDealersBreakdown,
  useCreateDealer,
  useUpdateDealer,
  useDeleteDealer,
  usePendingDealerRequests,
  useApproveDealerRequest,
  useRejectDealerRequest,
} from "./useDealers";

export {
  useCustomers,
  useCustomersAdmin,
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "./useCustomers";

export {
  useVehicles,
  useVehicleTable,
  useVehicle,
  useDealerVehicleSummary,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from "./useVehicles";

export {
  useInventory,
  useInventoryItem,
  useInventorySummary,
  useInventoryBreakdown,
  useCreateInventory,
  useUpdateInventory,
  useDeleteInventory,
} from "./useInventory";

export {
  useOrders,
  useOrdersFromQuotationTable,
  useOrder,
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
  useAssignOrderToSubAdmin,
  useAddChassisToOrder,
  useSendOrderToBilling,
  useGenerateBillForOrder,
  useMarkOrderDelivered,
} from "./useOrders";

export {
  useQuotations,
  useQuotationsFromTable,
  useQuotation,
  useCreateQuotation,
  useUpdateQuotation,
  useDeleteQuotation,
} from "./useQuotations";

export {
  useDispatches,
  useDispatch,
  useCreateDispatch,
  useUpdateDispatch,
  useDeleteDispatch,
} from "./useDispatch";

export {
  useDeliveries,
  useDelivery,
  useCreateDelivery,
  useUpdateDelivery,
  useDeleteDelivery,
} from "./useDelivery";

export {
  useWorkers,
  useWorker,
  useCreateWorker,
  useUpdateWorker,
  useDeleteWorker,
} from "./useWorkers";

export {
  useBillingPersons,
  useBillingPerson,
  useCreateBillingPerson,
  useUpdateBillingPerson,
  useDeleteBillingPerson,
} from "./useBillingPersons";

export {
  useNotificationsQuery,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from "./useNotifications";

export {
  useDashboard,
  useDashboardVehicles,
  useDashboardDealers,
  useDashboardSales,
} from "./useDashboard";

export {
  useVehicleReports,
  useCustomerReports,
  useDealerReports,
} from "./useReports";

export { useKnownChassis } from "./useForms";

export {
  useLoginMutation,
  useLogoutMutation,
  useChangePassword,
} from "./useAuth";
