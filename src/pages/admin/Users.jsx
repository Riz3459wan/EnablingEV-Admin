import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  User,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { ROLE_DASH } from "../../auth/roleConfig";
import Card from "../../components/ui/Card";
import { Input, Select } from "../../components/ui/Field";
import DataTable from "../../components/ui/DataTable";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
  Banner,
  ErrorCard,
  LoadingCard,
} from "../../components/ui/AsyncStates";
import { useUsers, useDeleteUser } from "../../hooks/useUsers";

const RoleBadge = ({ role }) => {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
        <ShieldCheck size={10} /> Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
      <User size={10} /> Sub Admin
    </span>
  );
};

const PasswordCell = ({ value, isProtected }) => {
  const [visible, setVisible] = useState(false);

  // Admin password — never visible
  if (isProtected) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 italic">
        <EyeOff size={12} />
        Protected
      </span>
    );
  }

  if (!value) return <span className="text-slate-400">—</span>;

  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs">
      {visible ? value : "•".repeat(Math.min(value.length, 10))}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-slate-400 hover:text-slate-700 transition-colors"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}
        >
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </Card>
  );
};

const Users = () => {
  const { role } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [limit, setLimit] = useState(25);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [banner, setBanner] = useState(null);

  const { data, loading, error } = useUsers();
  const deleteUser = useDeleteUser();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!term) return true;
      return [
        u.fullName,
        u.userId,
        u.email,
        u.mobileNumber,
        u.city,
        u.state,
      ].some((f) => f?.toString().toLowerCase().includes(term));
    });
  }, [data, search, roleFilter]);

  const visible = filtered.slice(0, limit);
  const resetPaging = () => setLimit(25);

  const stats = useMemo(() => {
    const list = data ?? [];
    return {
      total: list.length,
      admins: list.filter((u) => u.role === "admin").length,
      subAdmins: list.filter((u) => u.role === "subadmin").length,
    };
  }, [data]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBanner(null);
    try {
      await deleteUser.mutateAsync(deleteTarget.id);
      setBanner({
        type: "success",
        text: `Deleted user ${deleteTarget.fullName || deleteTarget.userId}.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setBanner({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Couldn't delete this user. Please try again.",
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "fullName",
        label: "Name",
        render: (row) => (
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                row.role === "admin"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {row.role === "admin" ? (
                <ShieldCheck size={14} />
              ) : (
                <User size={14} />
              )}
            </div>
            <div>
              <p className="font-medium text-slate-800">
                {row.fullName || "—"}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {row.userId || "—"}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "role",
        label: "Role",
        render: (row) => <RoleBadge role={row.role} />,
      },
      {
        key: "email",
        label: "Email",
        render: (row) => (
          <span className="flex items-center gap-1.5 text-slate-600 text-xs">
            <Mail size={12} className="text-slate-400" />
            {row.email || "—"}
          </span>
        ),
      },
      {
        key: "mobileNumber",
        label: "Mobile",
        render: (row) => (
          <span className="flex items-center gap-1.5 text-slate-600 text-xs">
            <Phone size={12} className="text-slate-400" />
            {row.mobileNumber || "—"}
          </span>
        ),
      },
      {
        key: "city",
        label: "City / State",
        render: (row) => (
          <span className="flex items-center gap-1.5 text-slate-600 text-xs">
            <MapPin size={12} className="text-slate-400" />
            {[row.city, row.state].filter(Boolean).join(", ") || "—"}
          </span>
        ),
      },
      {
        key: "password",
        label: "Password",
        render: (row) => (
          <PasswordCell
            value={row.password}
            isProtected={row.role === "admin"}
          />
        ),
      },
      {
        key: "actions",
        label: "",
        render: (row) =>
          row.role === "admin" ? (
            <span className="text-[10px] text-slate-400 italic">Protected</span>
          ) : (
            <button
              onClick={() => setDeleteTarget(row)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              aria-label={`Delete user ${row.fullName || row.userId}`}
            >
              <Trash2 size={16} />
            </button>
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

      <div className="mb-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          Administration
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Users
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          All admin and sub-admin accounts on the platform. Admin passwords are
          protected.
        </p>
      </div>

      {banner && <Banner type={banner.type}>{banner.text}</Banner>}

      {loading ? (
        <LoadingCard />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard
              icon={User}
              label="Total Users"
              value={stats.total}
              color="blue"
            />
            <StatCard
              icon={ShieldCheck}
              label="Admins"
              value={stats.admins}
              color="purple"
            />
            <StatCard
              icon={User}
              label="Sub Admins"
              value={stats.subAdmins}
              color="green"
            />
          </div>

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
                placeholder="Search by name, user ID, email..."
                className="!pl-10"
              />
            </div>

            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                resetPaging();
              }}
              className="lg:max-w-xs"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="subadmin">Sub Admin</option>
            </Select>

            <p className="text-xs text-slate-500 lg:ml-auto">
              Showing {visible.length} of {filtered.length}
            </p>
          </div>

          <DataTable
            columns={columns}
            rows={visible}
            rowKey={(row) => row.id ?? row.userId}
            emptyText={
              (data ?? []).length === 0
                ? "No users found."
                : "No users match your filters."
            }
          />

          {visible.length < filtered.length && (
            <div className="flex justify-center mt-5">
              <button
                onClick={() => setLimit((n) => n + 25)}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Show {Math.min(25, filtered.length - visible.length)} more
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete user?"
        message={`This permanently removes the user ${deleteTarget?.fullName || deleteTarget?.userId || ""}. This can't be undone.`}
        busy={deleteUser.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
};

export default Users;
