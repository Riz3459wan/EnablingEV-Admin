import { useNavigate } from "react-router";
import {
  Clock,
  CheckCircle2,
  UserCheck,
  AlertCircle,
  FileText,
  Truck,
  Package,
  ArrowUpRight,
} from "lucide-react";
import Card from "../ui/Card";

const ActionRequiredWidget = ({
  pendingOrders = 0,
  billingInProgress = 0,
  readyToDispatch = 0,
  dispatched = 0,
  pendingDealerRequests = 0,
}) => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Clock,
      label: "Orders Pending Approval",
      count: pendingOrders,
      color: "#f59e0b",
      bg: "from-amber-50 to-orange-50",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      path: "/orders?status=Pending%20Approval",
      actionLabel: "Review Now",
      priority: 1,
    },
    {
      icon: FileText,
      label: "Billing in Progress",
      count: billingInProgress,
      color: "#0ea5e9",
      bg: "from-sky-50 to-blue-50",
      border: "border-sky-200",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      path: "/orders?status=Billing%20in%20Progress",
      actionLabel: "Generate Bill",
      priority: 2,
    },
    {
      icon: Package,
      label: "Ready to Dispatch",
      count: readyToDispatch,
      color: "#8b5cf6",
      bg: "from-purple-50 to-fuchsia-50",
      border: "border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      path: "/orders?status=Ready%20to%20Dispatch",
      actionLabel: "Dispatch",
      priority: 3,
    },
    {
      icon: Truck,
      label: "Dispatched (Pending Delivery)",
      count: dispatched,
      color: "#f97316",
      bg: "from-orange-50 to-red-50",
      border: "border-orange-200",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      path: "/orders?status=Dispatched",
      actionLabel: "Mark Delivered",
      priority: 4,
    },
    {
      icon: UserCheck,
      label: "Dealer Requests Pending",
      count: pendingDealerRequests,
      color: "#3b82f6",
      bg: "from-blue-50 to-cyan-50",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      path: "/pendingDealerRequests",
      actionLabel: "Review",
      priority: 5,
    },
  ];

  const activeActions = actions.filter((a) => a.count > 0);
  const totalActions = activeActions.reduce((sum, a) => sum + a.count, 0);

  if (totalActions === 0) {
    return (
      <Card className="p-5 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              All caught up! 🎉
            </p>
            <p className="text-xs text-slate-500">
              No pending actions right now.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-2 border-red-100 bg-gradient-to-br from-red-50/40 to-white relative overflow-hidden animate-fade-in-up">
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-red-100 blur-2xl opacity-60 animate-pulse-slow" />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle size={16} className="text-red-600" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white animate-bounce">
              {totalActions}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800">
              Action Required
            </h3>
            <p className="text-[10px] text-slate-500">
              {totalActions} item{totalActions !== 1 ? "s" : ""} need your
              attention
            </p>
          </div>
        </div>

        {/* Tiles */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            activeActions.length > 3 ? "lg:grid-cols-5" : "lg:grid-cols-3"
          } gap-2`}
        >
          {activeActions.map((a, i) => {
            const Icon = a.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(a.path)}
                className={`group relative overflow-hidden rounded-xl p-3 bg-gradient-to-br ${a.bg} border ${a.border} text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-slide-up`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg ${a.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={14} className={a.iconColor} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-600 font-semibold truncate">
                      {a.label}
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span
                        className="text-xl font-black tabular"
                        style={{ color: a.color }}
                      >
                        {a.count}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">
                        {a.actionLabel}
                      </span>
                      <ArrowUpRight
                        size={9}
                        className="text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default ActionRequiredWidget;
