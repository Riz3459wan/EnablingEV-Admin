import { Routes, Route, Navigate } from "react-router";
import { lazy, Suspense } from "react";
import Layout from "../components/layout/Layout";
import ComingSoon from "../components/layout/ComingSoon";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import ProtectedRoute from "../auth/ProtectedRoute";

// ═══════════════════════════════════════════════════════════
//  SHARED PAGES
// ═══════════════════════════════════════════════════════════
const Orders = lazy(() => import("../pages/shared/Orders"));
const Inventory = lazy(() => import("../pages/shared/Inventory"));
const Dispatch = lazy(() => import("../pages/shared/Dispatch"));
const Delivery = lazy(() => import("../pages/shared/Delivery"));
const DealerDetails = lazy(() => import("../pages/shared/DealerDetails"));
const CustomerInfo = lazy(() => import("../pages/shared/CustomerInfo"));
const DisplayVehicleInfo = lazy(
  () => import("../pages/shared/DisplayVehicleInfo"),
);
const DealerInfo = lazy(() => import("../pages/shared/DealerInfo"));
const SubAdminInfo = lazy(() => import("../pages/shared/SubAdminInfo"));

// ═══════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════
const AdminLogin = lazy(() => import("../pages/auth/AdminLogin"));

// ═══════════════════════════════════════════════════════════
//  ADMIN PAGES
// ═══════════════════════════════════════════════════════════
const AdminDash = lazy(() => import("../pages/admin/AdminDash"));
const PendingDealerRequests = lazy(
  () => import("../pages/admin/PendingDealerRequests"),
);
const CreateProfileSubAdmin = lazy(
  () => import("../pages/admin/CreateProfileSubAdmin"),
);
const Users = lazy(() => import("../pages/admin/Users"));
const NotificationsPage = lazy(
  () => import("../pages/admin/NotificationsPage"),
);

// ═══════════════════════════════════════════════════════════
//  FORMS
// ═══════════════════════════════════════════════════════════
const Form22 = lazy(() => import("../pages/forms/Form22"));

// ═══════════════════════════════════════════════════════════
//  REPORTS
// ═══════════════════════════════════════════════════════════
const VehicleReports = lazy(() => import("../pages/reports/VehicleReports"));
const CustomerReports = lazy(() => import("../pages/reports/CustomerReports"));
const DealerReports = lazy(() => import("../pages/reports/DealerReports"));

// ═══════════════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════════════
const Profile = lazy(() => import("../pages/settings/Profile"));
const Security = lazy(() => import("../pages/settings/Security"));
const Preferences = lazy(() => import("../pages/settings/Preferences"));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* ── PUBLIC ── */}
        <Route path="/" element={<AdminLogin />} />

        {/* ── PROTECTED ── */}
        <Route
          element={
            <ProtectedRoute allow={["admin"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route
            path="/adminDash"
            element={
              <ErrorBoundary>
                <AdminDash />
              </ErrorBoundary>
            }
          />

          {/* Notifications */}
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Operations */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/dispatch" element={<Dispatch />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/displayCustomerInfo" element={<CustomerInfo />} />
          <Route path="/displayVehicleInfo" element={<DisplayVehicleInfo />} />
          <Route path="/form_22" element={<Form22 />} />

          {/* Redirect legacy quotations path */}
          <Route
            path="/quotations"
            element={<Navigate to="/orders" replace />}
          />

          {/* Dealers */}
          <Route path="/dealerInfo" element={<DealerInfo />} />
          <Route path="/dealerDetails/:id" element={<DealerDetails />} />
          <Route
            path="/pendingDealerRequests"
            element={<PendingDealerRequests />}
          />

          {/* Administration */}
          <Route path="/users" element={<Users />} />
          <Route path="/subAdminInfo" element={<SubAdminInfo />} />
          <Route
            path="/createProfileSubAdmin"
            element={<CreateProfileSubAdmin />}
          />

          {/* Reports */}
          <Route path="/reports/vehicles" element={<VehicleReports />} />
          <Route path="/reports/customers" element={<CustomerReports />} />
          <Route path="/reports/dealers" element={<DealerReports />} />

          {/* Settings */}
          <Route path="/settings/profile" element={<Profile />} />
          <Route path="/settings/security" element={<Security />} />
          <Route path="/settings/preferences" element={<Preferences />} />

          {/* 404 */}
          <Route path="*" element={<ComingSoon title="Page not found" />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
