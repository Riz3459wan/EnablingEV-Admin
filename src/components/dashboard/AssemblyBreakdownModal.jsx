import { useState } from "react";
import {
  CheckCircle2,
  Wrench,
  Layers,
  Palette,
  Battery,
  Car,
  ChevronRight,
} from "lucide-react";
import Modal from "../ui/Modal";
import VehiclesListModal from "./VehiclesListModal";

const TABS = [
  { key: "byBodyType", label: "Body Type", icon: Layers },
  { key: "byColor", label: "Color", icon: Palette },
  { key: "byBattery", label: "Battery", icon: Battery },
  { key: "byModel", label: "Model", icon: Car },
];

const getColorFor = (name, idx) => {
  const colorMap = {
    MS: "#3b82f6",
    SS: "#10b981",
    NR: "#8b5cf6",
    DS: "#f59e0b",
    Blue: "#3b82f6",
    Green: "#10b981",
    White: "#94a3b8",
    Red: "#ef4444",
    Yellow: "#fbbf24",
    "60V/100Ah": "#3b82f6",
    "48V/120Ah": "#10b981",
    "72V/100Ah": "#8b5cf6",
    F1: "#3b82f6",
    F2: "#06b6d4",
    F3: "#10b981",
    F4: "#8b5cf6",
    DELUX: "#f59e0b",
    LODER: "#10b981",
  };
  return (
    colorMap[name] ||
    ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"][idx % 5]
  );
};

const AssemblyBreakdownModal = ({ data, onClose }) => {
  const [activeTab, setActiveTab] = useState("byBodyType");
  const [vehiclesModal, setVehiclesModal] = useState(null);

  if (!data) return null;
  const { typeLabel, status, count, breakdown, vehicleTypeKey } = data;
  const isAssembled = status === "Assembled";
  const items = breakdown?.[activeTab] || [];

  const handleItemClick = (item) => {
    setVehiclesModal({
      title: `${typeLabel} · ${status} · ${item.name}`,
      filter: {
        vehicleTypeKey:
          vehicleTypeKey || (typeLabel.includes("Cargo") ? "cargo" : "rikshaw"),
        assemblyStatus: status.toLowerCase(),
        // future: pass specific filter based on tab
        tabKey: activeTab,
        tabValue: item.name,
      },
    });
  };

  return (
    <>
      <Modal
        open={!!data}
        onClose={onClose}
        title={`${typeLabel} · ${status} Breakdown`}
        subtitle={`${count} vehicles · Click any row to view vehicles`}
        maxWidth="max-w-2xl"
      >
        {/* Status Header */}
        <div
          className={`mb-4 p-4 rounded-xl border ${
            isAssembled
              ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
              : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                isAssembled ? "bg-emerald-100" : "bg-amber-100"
              }`}
            >
              {isAssembled ? (
                <CheckCircle2 size={22} className="text-emerald-600" />
              ) : (
                <Wrench size={22} className="text-amber-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {isAssembled ? "✅ Assembled Vehicles" : "🔧 Unassembled Kits"}
              </p>
              <p className="text-xs text-slate-500">
                {typeLabel} · {count} total {isAssembled ? "assembled" : "kits"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-slate-200 overflow-x-auto">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold transition-all whitespace-nowrap border-b-2 -mb-px ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <TabIcon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Items — Clickable */}
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">
              No data available
            </p>
          ) : (
            items.map((item, i) => {
              const pct = (item.value / count) * 100;
              const color = getColorFor(item.name, i);
              return (
                <button
                  key={item.name}
                  onClick={() => handleItemClick(item)}
                  className="group w-full text-left p-3 rounded-xl bg-white border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm transition-all active:scale-[0.99] animate-fade-in-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-[11px]"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {item.name.slice(0, 2)}
                      </div>
                      <span className="text-sm font-bold text-slate-800 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-black text-slate-800 tabular">
                        {item.value}
                      </span>
                      <span className="text-[10px] text-slate-400 tabular">
                        {pct.toFixed(0)}%
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                        boxShadow: `0 0 6px ${color}50`,
                      }}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        {items.length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-500">Total in this view</span>
            <span className="font-bold text-slate-800 tabular">
              {items.reduce((sum, item) => sum + item.value, 0)} units
            </span>
          </div>
        )}
      </Modal>

      <VehiclesListModal
        open={!!vehiclesModal}
        onClose={() => setVehiclesModal(null)}
        filter={vehiclesModal?.filter}
        title={vehiclesModal?.title}
      />
    </>
  );
};

export default AssemblyBreakdownModal;
