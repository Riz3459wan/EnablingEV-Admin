import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Trash2,
  Search,
  ShieldCheck,
  UserCheck,
  Send,
  FileText,
  Clock,
  ExternalLink,
  Filter,
  Check,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import Card from "../../components/ui/Card";
import { Input, Select } from "../../components/ui/Field";

const PAGE_SIZE = 15;

const NOTIFICATION_ICONS = {
  order: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Order",
  },
  billing: {
    icon: FileText,
    color: "text-purple-600",
    bg: "bg-purple-50",
    label: "Billing",
  },
  dealer: {
    icon: UserCheck,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Dealer",
  },
  assign: {
    icon: UserCheck,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    label: "Assignment",
  },
  send: {
    icon: Send,
    color: "text-orange-600",
    bg: "bg-orange-50",
    label: "Dispatch",
  },
  invoice: {
    icon: ShieldCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Invoice",
  },
};

const PRIORITY_STYLES = {
  high: { badge: "bg-red-50 text-red-700 border-red-200", label: "High" },
  medium: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Medium",
  },
  low: { badge: "bg-slate-50 text-slate-600 border-slate-200", label: "Low" },
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    highPriorityCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  } = useNotifications();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return notifications.filter((n) => {
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      if (statusFilter === "unread" && n.read) return false;
      if (statusFilter === "read" && !n.read) return false;
      if (!term) return true;
      return [n.title, n.message, n.subtext].some((f) =>
        f?.toString().toLowerCase().includes(term),
      );
    });
  }, [notifications, search, typeFilter, statusFilter]);

  const visible = filtered.slice(0, limit);
  const resetPaging = () => setLimit(PAGE_SIZE);

  const stats = useMemo(
    () => ({
      total: notifications.length,
      unread: unreadCount,
      high: highPriorityCount,
      today: notifications.filter(
        (n) => new Date() - new Date(n.timestamp) < 24 * 60 * 60 * 1000,
      ).length,
    }),
    [notifications, unreadCount, highPriorityCount],
  );

  const handleClick = (n) => {
    markAsRead(n.id);
    if (n.actionPath) navigate(n.actionPath);
  };

  const typeOptions = [
    ["all", "All Types"],
    ["order_pending", "Pending Orders"],
    ["order_ready", "Ready for Billing"],
    ["order_assigned", "Assigned Orders"],
    ["dealer_request", "Dealer Requests"],
    ["billing_sent", "Sent to Billing"],
    ["dealer_approved", "Dealer Approved"],
    ["order_billed", "Billed Orders"],
  ];

  return (
    <section className="w-full max-w-5xl mx-auto">
      <Link
        to="/adminDash"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
      >
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Activity
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            All your alerts, updates, and action items in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors active:scale-95"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors active:scale-95"
            >
              <Trash2 size={13} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="p-4">
          <p className="text-xs text-slate-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-blue-600 mb-1">Unread</p>
          <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-red-600 mb-1">High Priority</p>
          <p className="text-2xl font-bold text-red-600">{stats.high}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-emerald-600 mb-1">Today</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.today}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
        <div className="relative w-full lg:max-w-sm">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPaging();
            }}
            placeholder="Search notifications..."
            className="!pl-10"
          />
        </div>

        <Select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            resetPaging();
          }}
          className="lg:max-w-xs"
        >
          {typeOptions.map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </Select>

        <div className="inline-flex self-start rounded-lg border border-slate-300 bg-white p-1">
          {[
            ["all", "All"],
            ["unread", "Unread"],
            ["read", "Read"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setStatusFilter(value);
                resetPaging();
              }}
              aria-pressed={statusFilter === value}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === value
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-500 lg:ml-auto">
          Showing {visible.length} of {filtered.length}
        </p>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Bell size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No notifications found</p>
          <p className="text-slate-400 text-xs mt-1">
            {search || typeFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters."
              : "You're all caught up!"}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {visible.map((n, idx) => {
            const iconData =
              NOTIFICATION_ICONS[n.icon] || NOTIFICATION_ICONS.order;
            const Icon = iconData.icon;
            const priority = PRIORITY_STYLES[n.priority] || PRIORITY_STYLES.low;
            return (
              <Card
                key={n.id}
                className={`p-4 group hover:shadow-md transition-all animate-fade-in-up ${
                  !n.read ? "border-l-4 border-l-blue-500 bg-blue-50/20" : ""
                }`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${iconData.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={18} className={iconData.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                        )}
                        <h3
                          className={`text-sm truncate ${!n.read ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}
                        >
                          {n.title}
                        </h3>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${priority.badge} shrink-0`}
                        >
                          {priority.label}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(n.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all shrink-0 p-1 hover:bg-red-50 rounded-md"
                        aria-label="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 mb-1">{n.message}</p>
                    {n.subtext && (
                      <p className="text-[11px] text-slate-400 mb-2">
                        {n.subtext}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400">
                          {n.time}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${iconData.color} uppercase tracking-wider`}
                        >
                          {iconData.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {n.actionLabel && (
                          <button
                            onClick={() => handleClick(n)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 px-2 py-1 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            {n.actionLabel}
                            <ExternalLink size={10} />
                          </button>
                        )}
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1"
                          >
                            <Check size={11} /> Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {visible.length < filtered.length && (
        <div className="flex justify-center mt-5">
          <button
            onClick={() => setLimit((n) => n + PAGE_SIZE)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Show {Math.min(PAGE_SIZE, filtered.length - visible.length)} more
          </button>
        </div>
      )}
    </section>
  );
};

export default NotificationsPage;
