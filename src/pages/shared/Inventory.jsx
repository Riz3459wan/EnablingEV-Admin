import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Plus,
  Package,
  CheckCircle2,
  Trash2,
  Eye,
  Wrench,
  Truck,
  Warehouse,
  Battery,
  MapPin,
  X,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { ROLE_DASH, ROLE_LABEL } from "../../auth/roleConfig";
import { Input, Select, Textarea } from "../../components/ui/Field";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import Card from "../../components/ui/Card";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Pagination from "../../components/ui/Pagination";
import FilterSelect from "../../components/ui/FilterSelect";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button";
import {
  Banner,
  ErrorCard,
  LoadingCard,
} from "../../components/ui/AsyncStates";
import {
  useInventory,
  useCreateInventory,
  useDeleteInventory,
} from "../../hooks/useInventory";
import usePagination from "../../hooks/usePagination";

const ASSEMBLY_STATUS = {
  UNASSEMBLED: "Unassembled",
  ASSEMBLED: "Assembled",
  READY_TO_DISPATCH: "Ready to Dispatch",
  DISPATCHED: "Dispatched",
};

const ASSEMBLY_STATUS_STYLES = {
  Unassembled: "bg-amber-50 text-amber-700 border-amber-200",
  Assembled: "bg-blue-50 text-blue-700 border-blue-200",
  "Ready to Dispatch": "bg-purple-50 text-purple-700 border-purple-200",
  Dispatched: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const ASSEMBLY_ICONS = {
  Unassembled: Wrench,
  Assembled: Package,
  "Ready to Dispatch": Truck,
  Dispatched: CheckCircle2,
};

const AssemblyStatusBadge = ({ status }) => {
  const Icon = ASSEMBLY_ICONS[status] || Wrench;
  const style =
    ASSEMBLY_STATUS_STYLES[status] || ASSEMBLY_STATUS_STYLES.Unassembled;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full border ${style}`}
    >
      <Icon size={9} />
      {status}
    </span>
  );
};

const MODELS = ["F1", "F2", "F3", "F4", "DELUX", "LODER"];
const BODY_TYPES = ["MS", "SS", "NR", "DS"];
const COLORS = ["Blue", "Green", "White", "Red", "Yellow"];
const BATTERIES = [
  { type: "Lithium", volt: 60, ah: 100, label: "60V / 100Ah" },
  { type: "Lithium", volt: 48, ah: 120, label: "48V / 120Ah" },
];
const STORAGE_LOCATIONS = [
  "Warehouse A, Delhi",
  "Warehouse B, Jaipur",
  "Warehouse C, Lucknow",
];

// ── Helpers ──
const RICKSHAW_MODELS = ["F1", "F2", "F3", "F4", "DELUX", "T1", "FINE"];
const matchesType = (item, type) => {
  if (!type || type === "all") return true;
  const isRikshaw = RICKSHAW_MODELS.includes(item.modelName);
  return type === "cargo" ? !isRikshaw : isRikshaw;
};

const matchesAssembly = (item, assembly) => {
  if (!assembly || assembly === "all") return true;
  if (assembly === "assembled") return item.assemblyStatus === "Assembled";
  if (assembly === "unassembled") return item.assemblyStatus === "Unassembled";
  if (assembly === "ready") return item.assemblyStatus === "Ready to Dispatch";
  if (assembly === "dispatched") return item.assemblyStatus === "Dispatched";
  return true;
};

const roleLabel = (role) => {
  if (role === "subadmin") return "Sub-Admin";
  if (role === "admin") return "Admin";
  if (role === "dealer") return "Dealer";
  return role;
};

// ── Add Inventory Modal ──
const AddInventoryModal = ({ open, onClose, onAdd, isSubmitting }) => {
  const [form, setForm] = useState({
    modelName: "F1",
    bodyTypeName: "MS",
    colorName: "Blue",
    batteryIndex: 0,
    assemblyStatus: "Unassembled",
    storageLocation: "Warehouse A, Delhi",
    notes: "",
  });
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError("");
  };

  const handleSubmit = () => {
    setError("");
    const battery = BATTERIES[form.batteryIndex];
    onAdd({
      modelName: form.modelName,
      bodyTypeName: form.bodyTypeName,
      colorName: form.colorName,
      batteryType: battery.type,
      batteryVolt: battery.volt,
      batteryAmpereHours: battery.ah,
      assemblyStatus: form.assemblyStatus,
      storageLocation: form.storageLocation,
      notes: form.notes,
    });
    setForm({
      modelName: "F1",
      bodyTypeName: "MS",
      colorName: "Blue",
      batteryIndex: 0,
      assemblyStatus: "Unassembled",
      storageLocation: "Warehouse A, Delhi",
      notes: "",
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New Inventory"
      subtitle="Chassis number will be assigned when the vehicle is assembled"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Info banner */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            New vehicles are added as <strong>Unassembled</strong>. Chassis
            number is assigned during assembly, along with the assembler's name.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 uppercase tracking-wider">
              Model
            </label>
            <Select value={form.modelName} onChange={handleChange("modelName")}>
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 uppercase tracking-wider">
              Body Type
            </label>
            <Select
              value={form.bodyTypeName}
              onChange={handleChange("bodyTypeName")}
            >
              {BODY_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 uppercase tracking-wider">
              Color
            </label>
            <Select value={form.colorName} onChange={handleChange("colorName")}>
              {COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 uppercase tracking-wider">
              Battery
            </label>
            <Select
              value={form.batteryIndex}
              onChange={handleChange("batteryIndex")}
            >
              {BATTERIES.map((b, i) => (
                <option key={i} value={i}>
                  {b.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 uppercase tracking-wider">
              Assembly Status
            </label>
            <Select
              value={form.assemblyStatus}
              onChange={handleChange("assemblyStatus")}
            >
              <option value="Unassembled">Unassembled</option>
              <option value="Assembled">Assembled</option>
              <option value="Ready to Dispatch">Ready to Dispatch</option>
              <option value="Dispatched">Dispatched</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 uppercase tracking-wider">
              Storage Location
            </label>
            <Select
              value={form.storageLocation}
              onChange={handleChange("storageLocation")}
            >
              {STORAGE_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 text-slate-700 uppercase tracking-wider">
            Notes (Optional)
          </label>
          <Textarea
            rows={2}
            value={form.notes}
            onChange={handleChange("notes")}
            placeholder="Any additional notes..."
          />
        </div>

        {error && (
          <div className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2"
          >
            <Plus size={14} />
            {isSubmitting ? "Adding..." : "Add to Inventory"}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
};

// ── Inventory Detail Modal ──
const InventoryDetailModal = ({ item, onClose }) => {
  if (!item) return null;

  const Row = ({ label, value, mono, icon: Icon }) => {
    let safeValue = value;
    if (value === null || value === undefined || value === "") {
      safeValue = "—";
    } else if (typeof value === "object") {
      safeValue = value.name || "—";
    }

    return (
      <div className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          {Icon && <Icon size={12} className="text-slate-400" />}
          {label}
        </span>
        <span
          className={`text-sm text-slate-800 font-medium text-right ${mono ? "font-mono text-xs" : ""}`}
        >
          {safeValue}
        </span>
      </div>
    );
  };

  const roleLabel = (role) =>
    role === "subadmin"
      ? "Sub-Admin"
      : role === "admin"
        ? "Admin"
        : role || "—";

  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title="Inventory Details"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package size={16} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                Inventory Item
              </span>
            </div>
            <p className="text-lg font-black text-slate-800 font-mono">
              {item.chassisNumber || (
                <span className="text-slate-400 italic text-sm font-sans">
                  Chassis not yet assigned
                </span>
              )}
            </p>
          </div>
          <AssemblyStatusBadge status={item.assemblyStatus} />
        </div>

        {/* Vehicle Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-blue-500" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Vehicle Details
            </p>
          </div>
          <Row label="Model" value={item.modelName} />
          <Row label="Body Type" value={item.bodyTypeName} />
          <Row label="Color" value={item.colorName} />
          <Row
            label="Battery"
            value={[
              item.batteryType,
              item.batteryVolt && `${item.batteryVolt}V`,
              item.batteryAmpereHours && `${item.batteryAmpereHours}Ah`,
            ]
              .filter(Boolean)
              .join(" / ")}
            icon={Battery}
          />
        </div>

        {/* Storage Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-emerald-500" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Storage Info
            </p>
          </div>
          <Row label="Location" value={item.storageLocation} icon={MapPin} />
          <Row label="Added On" value={item.addedOn} />
        </div>

        {/* Assembled By */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-purple-500" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Assembled By
            </p>
          </div>
          {item.assembledBy ? (
            <>
              <Row label="Worker Name" value={item.assembledBy.name} />
              <Row label="Worker ID" value={item.assembledBy.id} mono />
              <Row label="Assembled On" value={item.assembledOn} />
            </>
          ) : (
            <Row label="Status" value="Not yet assembled" />
          )}
        </div>

        {/* Added By */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-slate-400" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Added By
            </p>
          </div>
          {item.addedBy && typeof item.addedBy === "object" ? (
            <>
              <Row label="Name" value={item.addedBy.name} />
              <Row label="Role" value={roleLabel(item.addedBy.role)} />
            </>
          ) : (
            <Row label="Added By" value={item.addedBy} />
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};
// ── Filter helper ──
const applyFilters = (list, filters, exclude) => {
  return list.filter((v) => {
    if (
      exclude !== "type" &&
      filters.type !== "all" &&
      !matchesType(v, filters.type)
    )
      return false;
    if (
      exclude !== "assembly" &&
      filters.assembly !== "all" &&
      !matchesAssembly(v, filters.assembly)
    )
      return false;
    if (
      exclude !== "model" &&
      filters.model !== "all" &&
      v.modelName !== filters.model
    )
      return false;
    if (
      exclude !== "bodyType" &&
      filters.bodyType !== "all" &&
      v.bodyTypeName !== filters.bodyType
    )
      return false;
    if (
      exclude !== "color" &&
      filters.color !== "all" &&
      v.colorName !== filters.color
    )
      return false;
    if (exclude !== "battery" && filters.battery !== "all") {
      const batt = `${v.batteryVolt}V/${v.batteryAmpereHours}Ah`;
      if (batt !== filters.battery) return false;
    }
    if (
      exclude !== "location" &&
      filters.location !== "all" &&
      v.storageLocation !== filters.location
    )
      return false;
    return true;
  });
};

// ── Main Component ──
const Inventory = () => {
  const { role } = useAuth();
  const isSubAdmin = role === "subadmin";
  const isAdmin = role === "admin";

  const [searchParams, setSearchParams] = useSearchParams();

  const urlType = searchParams.get("type") || "all";
  const urlAssembly = searchParams.get("assembly") || "all";
  const urlModel = searchParams.get("model") || "all";
  const urlBodyType = searchParams.get("bodyType") || "all";

  const [typeFilter, setTypeFilter] = useState(urlType);
  const [assemblyFilter, setAssemblyFilter] = useState(
    ["assembled", "unassembled", "ready", "dispatched"].includes(urlAssembly)
      ? urlAssembly
      : "all",
  );
  const [modelFilter, setModelFilter] = useState(urlModel);
  const [bodyTypeFilter, setBodyTypeFilter] = useState(urlBodyType);
  const [colorFilter, setColorFilter] = useState("all");
  const [batteryFilter, setBatteryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    setTypeFilter(urlType);
    setAssemblyFilter(
      ["assembled", "unassembled", "ready", "dispatched"].includes(urlAssembly)
        ? urlAssembly
        : "all",
    );
    setModelFilter(urlModel);
    setBodyTypeFilter(urlBodyType);
    setColorFilter("all");
    setBatteryFilter("all");
    setLocationFilter("all");
  }, [urlType, urlAssembly, urlModel, urlBodyType]);

  const { data, loading, error } = useInventory();
  const createInventory = useCreateInventory();
  const deleteInventory = useDeleteInventory();

  const list = data ?? [];

  const currentFilters = {
    type: typeFilter,
    assembly: assemblyFilter,
    model: modelFilter,
    bodyType: bodyTypeFilter,
    color: colorFilter,
    battery: batteryFilter,
    location: locationFilter,
  };

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "rikshaw", label: "Rikshaw" },
    { value: "cargo", label: "Cargo / Loader" },
  ];

  const assemblyOptions = [
    { value: "all", label: "All Assembly" },
    { value: "unassembled", label: "Unassembled" },
    { value: "assembled", label: "Assembled" },
    { value: "ready", label: "Ready to Dispatch" },
    { value: "dispatched", label: "Dispatched" },
  ];

  const modelOptions = useMemo(() => {
    const base = applyFilters(list, currentFilters, "model");
    const values = [
      ...new Set(base.map((i) => i.modelName).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All Models" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    list,
    typeFilter,
    assemblyFilter,
    bodyTypeFilter,
    colorFilter,
    batteryFilter,
    locationFilter,
  ]);

  const bodyTypeOptions = useMemo(() => {
    const base = applyFilters(list, currentFilters, "bodyType");
    const values = [
      ...new Set(base.map((i) => i.bodyTypeName).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All Body Types" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    list,
    typeFilter,
    assemblyFilter,
    modelFilter,
    colorFilter,
    batteryFilter,
    locationFilter,
  ]);

  const colorOptions = useMemo(() => {
    const base = applyFilters(list, currentFilters, "color");
    const values = [
      ...new Set(base.map((i) => i.colorName).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All Colors" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    list,
    typeFilter,
    assemblyFilter,
    modelFilter,
    bodyTypeFilter,
    batteryFilter,
    locationFilter,
  ]);

  const batteryOptions = useMemo(() => {
    const base = applyFilters(list, currentFilters, "battery");
    const values = [
      ...new Set(
        base
          .map((i) =>
            i.batteryVolt && i.batteryAmpereHours
              ? `${i.batteryVolt}V/${i.batteryAmpereHours}Ah`
              : null,
          )
          .filter(Boolean),
      ),
    ].sort();
    return [
      { value: "all", label: "All Batteries" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    list,
    typeFilter,
    assemblyFilter,
    modelFilter,
    bodyTypeFilter,
    colorFilter,
    locationFilter,
  ]);

  const locationOptions = useMemo(() => {
    const base = applyFilters(list, currentFilters, "location");
    const values = [
      ...new Set(base.map((i) => i.storageLocation).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All Locations" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    list,
    typeFilter,
    assemblyFilter,
    modelFilter,
    bodyTypeFilter,
    colorFilter,
    batteryFilter,
  ]);

  useEffect(() => {
    if (
      bodyTypeFilter !== "all" &&
      !bodyTypeOptions.some((o) => o.value === bodyTypeFilter)
    ) {
      setBodyTypeFilter("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    typeFilter,
    assemblyFilter,
    modelFilter,
    colorFilter,
    batteryFilter,
    locationFilter,
  ]);

  useEffect(() => {
    if (
      colorFilter !== "all" &&
      !colorOptions.some((o) => o.value === colorFilter)
    ) {
      setColorFilter("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    typeFilter,
    assemblyFilter,
    modelFilter,
    bodyTypeFilter,
    batteryFilter,
    locationFilter,
  ]);

  useEffect(() => {
    if (
      batteryFilter !== "all" &&
      !batteryOptions.some((o) => o.value === batteryFilter)
    ) {
      setBatteryFilter("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    typeFilter,
    assemblyFilter,
    modelFilter,
    bodyTypeFilter,
    colorFilter,
    locationFilter,
  ]);

  const filtered = useMemo(() => {
    return applyFilters(list, currentFilters, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    list,
    typeFilter,
    assemblyFilter,
    modelFilter,
    bodyTypeFilter,
    colorFilter,
    batteryFilter,
    locationFilter,
  ]);

  const pagination = usePagination(filtered, 25);

  const hasActiveFilters =
    typeFilter !== "all" ||
    assemblyFilter !== "all" ||
    modelFilter !== "all" ||
    bodyTypeFilter !== "all" ||
    colorFilter !== "all" ||
    batteryFilter !== "all" ||
    locationFilter !== "all";

  const clearFilters = () => {
    setTypeFilter("all");
    setAssemblyFilter("all");
    setModelFilter("all");
    setBodyTypeFilter("all");
    setColorFilter("all");
    setBatteryFilter("all");
    setLocationFilter("all");
    setSearchParams({});
    pagination.reset();
  };

  const stats = useMemo(() => {
    const total = list.length;
    const unassembled = list.filter(
      (i) => i.assemblyStatus === "Unassembled",
    ).length;
    const assembled = list.filter(
      (i) => i.assemblyStatus === "Assembled",
    ).length;
    const readyToDispatch = list.filter(
      (i) => i.assemblyStatus === "Ready to Dispatch",
    ).length;
    const dispatched = list.filter(
      (i) => i.assemblyStatus === "Dispatched",
    ).length;
    return { total, unassembled, assembled, readyToDispatch, dispatched };
  }, [list]);

  const handleAdd = async (form) => {
    setBanner(null);
    try {
      await createInventory.mutateAsync(form);
      setBanner({
        type: "success",
        text: `Added new ${form.modelName} to inventory.`,
      });
      setAddOpen(false);
    } catch (err) {
      setBanner({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Couldn't add this inventory item. Please try again.",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBanner(null);
    try {
      await deleteInventory.mutateAsync(deleteTarget.id);
      setBanner({
        type: "success",
        text: `Removed ${deleteTarget.chassisNumber || `${deleteTarget.modelName} item`} from inventory.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setBanner({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Couldn't remove this item. Please try again.",
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "chassisNumber",
        label: "Chassis No.",
        render: (row) =>
          row.chassisNumber ? (
            <span className="font-mono text-xs text-slate-800">
              {row.chassisNumber}
            </span>
          ) : (
            <span className="text-slate-400 italic text-xs">
              Not yet assigned
            </span>
          ),
      },
      { key: "modelName", label: "Model" },
      { key: "bodyTypeName", label: "Body" },
      { key: "colorName", label: "Color" },
      {
        key: "battery",
        label: "Battery",
        render: (row) => (
          <span className="text-xs text-slate-600">
            {row.batteryVolt}V / {row.batteryAmpereHours}Ah
          </span>
        ),
      },
      {
        key: "storageLocation",
        label: "Location",
        render: (row) => (
          <span className="text-xs text-slate-600">{row.storageLocation}</span>
        ),
      },
      {
        key: "assemblyStatus",
        label: "Assembly",
        render: (row) => <AssemblyStatusBadge status={row.assemblyStatus} />,
      },
      {
        key: "assembledBy",
        label: "Assembled By",
        render: (row) =>
          row.assembledBy ? (
            <div>
              <p className="font-medium text-slate-800 text-xs">
                {row.assembledBy.name}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                {row.assembledBy.id}
              </p>
            </div>
          ) : (
            <span className="text-slate-400 italic text-xs">—</span>
          ),
      },
      {
        key: "addedBy",
        label: "Added By",
        render: (row) => {
          const addedBy = row.addedBy;
          if (!addedBy)
            return <span className="text-slate-400 text-xs">—</span>;
          if (typeof addedBy === "string") {
            return <span className="text-xs text-slate-700">{addedBy}</span>;
          }
          return (
            <div>
              <p className="font-medium text-slate-800 text-xs">
                {addedBy.name}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                {roleLabel(addedBy.role)}
              </p>
            </div>
          );
        },
      },
      {
        key: "actions",
        label: "",
        render: (row) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedItem(row)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              aria-label="View details"
            >
              <Eye size={16} />
            </button>
            {row.assemblyStatus === "Unassembled" && (
              <button
                onClick={() => setDeleteTarget(row)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <section className="w-full">
      <Link
        to={ROLE_DASH[role] || "/adminDash"}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
      >
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            {ROLE_LABEL[role]} · Operations
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Inventory
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage vehicle stock — assembled, unassembled, and dispatched.
          </p>
        </div>
        {(isSubAdmin || isAdmin) && (
          <PrimaryButton
            onClick={() => setAddOpen(true)}
            className="gap-2 shrink-0"
          >
            <Plus size={16} />
            Add Inventory
          </PrimaryButton>
        )}
      </div>

      {banner && <Banner type={banner.type}>{banner.text}</Banner>}

      {loading ? (
        <LoadingCard rows={6} />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Warehouse size={14} className="text-slate-500" />
                <p className="text-xs text-slate-500">Total Stock</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Wrench size={14} className="text-amber-600" />
                <p className="text-xs text-amber-600">Unassembled</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {stats.unassembled}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Package size={14} className="text-blue-600" />
                <p className="text-xs text-blue-600">Assembled</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.assembled}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Truck size={14} className="text-purple-600" />
                <p className="text-xs text-purple-600">Ready</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {stats.readyToDispatch}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <p className="text-xs text-emerald-600">Dispatched</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {stats.dispatched}
              </p>
            </Card>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4 flex-wrap">
            <FilterSelect
              label="Vehicle type"
              value={typeFilter}
              onChange={(v) => {
                setTypeFilter(v);
                pagination.reset();
              }}
              options={typeOptions}
              className="w-full lg:w-40"
            />
            <FilterSelect
              label="Assembly"
              value={assemblyFilter}
              onChange={(v) => {
                setAssemblyFilter(v);
                pagination.reset();
              }}
              options={assemblyOptions}
              className="w-full lg:w-44"
            />
            <FilterSelect
              label="Model"
              value={modelFilter}
              onChange={(v) => {
                setModelFilter(v);
                pagination.reset();
              }}
              options={modelOptions}
              className="w-full lg:w-36"
            />
            <FilterSelect
              label="Body Type"
              value={bodyTypeFilter}
              onChange={(v) => {
                setBodyTypeFilter(v);
                pagination.reset();
              }}
              options={bodyTypeOptions}
              className="w-full lg:w-40"
            />
            <FilterSelect
              label="Color"
              value={colorFilter}
              onChange={(v) => {
                setColorFilter(v);
                pagination.reset();
              }}
              options={colorOptions}
              className="w-full lg:w-36"
            />
            <FilterSelect
              label="Battery"
              value={batteryFilter}
              onChange={(v) => {
                setBatteryFilter(v);
                pagination.reset();
              }}
              options={batteryOptions}
              className="w-full lg:w-44"
            />
            <FilterSelect
              label="Location"
              value={locationFilter}
              onChange={(v) => {
                setLocationFilter(v);
                pagination.reset();
              }}
              options={locationOptions}
              className="w-full lg:w-48"
            />

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors w-fit"
              >
                <X size={13} />
                Clear filters
              </button>
            )}

            <p className="text-xs text-slate-500 lg:ml-auto">
              Showing {pagination.total}{" "}
              {pagination.total === 1 ? "item" : "items"}
            </p>
          </div>

          <DataTable
            columns={columns}
            rows={pagination.pageItems}
            rowKey={(row) => row.id ?? row.chassisNumber}
            emptyText={
              hasActiveFilters
                ? "No items match your filters."
                : "No inventory yet. Add stock to get started."
            }
          />

          <Pagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        </>
      )}

      <AddInventoryModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
        isSubmitting={createInventory.isPending}
      />
      <InventoryDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
      <ConfirmModal
        open={!!deleteTarget}
        title="Remove from inventory?"
        message={`This will remove ${deleteTarget?.chassisNumber || `${deleteTarget?.modelName || "this"} item`} from inventory. This can't be undone.`}
        busy={deleteInventory.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
};

export default Inventory;
