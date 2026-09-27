import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import {
  Bell,
  LogOut,
  User,
  Settings,
  Menu,
  ChevronDown,
  CheckCheck,
  ExternalLink,
  ShieldCheck,
  FileText,
  UserCheck,
  Send,
  Clock,
  ChevronRight,
  Home,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import BrandMark from "../ui/BrandMark";

// ═══════════════════════════════════════════════════════════
//  BREADCRUMB MAPPER
// ═══════════════════════════════════════════════════════════
const BREADCRUMB_MAP = {
  adminDash: "Dashboard",
  orders: "Orders",
  inventory: "Inventory",
  dispatch: "Dispatch",
  delivery: "Delivery",
  form_22: "Form 22",
  pendingDealerRequests: "Pending Dealer Requests",
  displayCustomerInfo: "Customers",
  displayVehicleInfo: "Vehicles",
  dealerInfo: "Dealers",
  subAdminInfo: "Sub Admins",
  users: "Users",
  createProfileSubAdmin: "Create Sub Admin",
  notifications: "Notifications",
  reports: "Reports",
  vehicles: "Vehicle Reports",
  customers: "Customer Reports",
  dealers: "Dealer Reports",
  settings: "Settings",
  profile: "Profile",
  security: "Security",
  preferences: "Preferences",
};

const buildBreadcrumb = (pathname) => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [{ label: "Dashboard", path: "/" }];

  const crumbs = [];
  let currentPath = "";

  segments.forEach((seg) => {
    currentPath += `/${seg}`;
    const label =
      BREADCRUMB_MAP[seg] ||
      seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    crumbs.push({ label, path: currentPath });
  });

  return crumbs;
};

const NOTIFICATION_ICONS = {
  order: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  billing: { icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10" },
  dealer: { icon: UserCheck, color: "text-blue-400", bg: "bg-blue-500/10" },
  assign: { icon: UserCheck, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  send: { icon: Send, color: "text-orange-400", bg: "bg-orange-500/10" },
  invoice: {
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
};

const PRIORITY_STYLES = {
  high: "border-l-4 border-l-red-500",
  medium: "border-l-4 border-l-amber-500",
  low: "border-l-2 border-l-slate-600",
};

const AdminNavbar = ({ onMenuClick, sidebarLeftClass = "lg:left-64" }) => {
  const { logout, user } = useAuth();
  const {
    notifications,
    unreadCount,
    highPriorityCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNotificationClick = (n) => {
    markAsRead(n.id);
    if (n.actionPath) navigate(n.actionPath);
    setNotifOpen(false);
  };

  const recentNotifications = notifications.slice(0, 5);

  const displayName = user?.fullName || "Admin";
  const displayEmail = user?.email || "admin@enablingev.com";
  const avatarLetter = (displayName || "A").charAt(0).toUpperCase();

  const breadcrumb = buildBreadcrumb(location.pathname);
  const isDashboard = location.pathname === "/adminDash";

  return (
    <header
      className={`fixed top-0 left-0 ${sidebarLeftClass} right-0 z-30 h-16 sm:h-20 bg-[#0f172a] border-b border-slate-800 animate-fade-in-down transition-all duration-300`}
    >
      <div className="flex items-center justify-between h-full px-3 sm:px-6 gap-2">
        {/* ═══ LEFT: Menu + Logo + Breadcrumb/Welcome ═══ */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors active:scale-95 shrink-0"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Mobile Logo */}
          <Link
            to="/adminDash"
            className="lg:hidden flex items-center gap-2 shrink-0 group"
          >
            <BrandMark className="h-8 w-auto transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
          </Link>

          {/* Dashboard: Welcome text | Others: Breadcrumb */}
          {isDashboard ? (
            <p className="hidden lg:block text-sm font-medium text-slate-400 truncate">
              Welcome back,{" "}
              <span className="text-white font-bold">{displayName}</span> 👋
            </p>
          ) : (
            <nav
              className="hidden lg:flex items-center gap-1 min-w-0 overflow-hidden"
              aria-label="Breadcrumb"
            >
              <Link
                to="/adminDash"
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <Home size={14} />
              </Link>

              {breadcrumb.map((crumb, i) => {
                const isLast = i === breadcrumb.length - 1;
                return (
                  <div
                    key={crumb.path}
                    className="flex items-center gap-1 min-w-0"
                  >
                    <ChevronRight
                      size={12}
                      className="text-slate-600 shrink-0"
                    />
                    {isLast ? (
                      <span className="text-sm font-bold text-white truncate">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.path}
                        className="text-sm font-medium text-slate-400 hover:text-white transition-colors truncate"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          )}
        </div>

        {/* ═══ RIGHT: Notifications + Settings + Profile ═══ */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((p) => !p)}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a] animate-pulse" />
                  <span
                    className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 ${highPriorityCount > 0 ? "bg-red-500 animate-bounce" : "bg-slate-600"}`}
                  >
                    {unreadCount}
                  </span>
                </>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-24px)] bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl shadow-slate-900/50 overflow-hidden animate-scale-in origin-top-right">
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <CheckCheck size={11} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                        <Bell size={20} className="text-slate-500" />
                      </div>
                      <p className="text-sm text-slate-400">No notifications</p>
                    </div>
                  ) : (
                    recentNotifications.map((n) => {
                      const iconData =
                        NOTIFICATION_ICONS[n.icon] || NOTIFICATION_ICONS.order;
                      const Icon = iconData.icon;
                      const priorityClass = PRIORITY_STYLES[n.priority] || "";
                      return (
                        <button
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-800/50 transition-colors border-b border-slate-800 last:border-0 ${priorityClass} ${
                            !n.read ? "bg-blue-500/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg ${iconData.bg} flex items-center justify-center shrink-0`}
                            >
                              <Icon size={15} className={iconData.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {!n.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                )}
                                <p className="text-xs font-bold text-white truncate">
                                  {n.title}
                                </p>
                              </div>
                              <p className="text-[11px] text-slate-300 truncate">
                                {n.message}
                              </p>
                              {n.subtext && (
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                  {n.subtext}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-[10px] text-slate-500">
                                  {n.time}
                                </span>
                                {n.actionLabel && (
                                  <span className="text-[10px] font-bold text-blue-400 flex items-center gap-0.5">
                                    {n.actionLabel}
                                    <ExternalLink size={9} />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="border-t border-slate-800">
                    <button
                      onClick={() => {
                        navigate("/notifications");
                        setNotifOpen(false);
                      }}
                      className="w-full py-3 text-xs font-bold text-slate-300 hover:bg-slate-800/50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      View All Notifications
                      <ChevronDown size={12} className="-rotate-90" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={() => navigate("/settings/preferences")}
            className="hidden sm:block p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>

          <div className="hidden sm:block h-8 w-px bg-slate-700" />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-lg hover:bg-slate-800 transition-colors active:scale-95"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {avatarLetter}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-white leading-tight">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Admin
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`hidden md:block text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl shadow-slate-900/50 overflow-hidden animate-scale-in origin-top-right">
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {avatarLetter}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {displayEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/settings/profile");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <User size={16} className="text-slate-500" /> My Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/settings/security");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <Settings size={16} className="text-slate-500" /> Security
                  </button>
                </div>

                <div className="border-t border-slate-800 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
