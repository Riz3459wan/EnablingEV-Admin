import { useState } from "react";
import { Lock, Shield, Key, Smartphone } from "lucide-react";
import Card from "../../components/ui/Card";
import Field, { PasswordInput } from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/Button";
import { useChangePassword } from "../../hooks/useAuth";

const Security = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);

  const changePassword = useChangePassword();

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setBanner(null);
  };

  const validate = () => {
    const e = {};
    if (!form.currentPassword) {
      e.currentPassword = "Current password is required.";
    }
    if (!form.newPassword) {
      e.newPassword = "New password is required.";
    } else if (form.newPassword.length < 6) {
      e.newPassword = "Password must be at least 6 characters.";
    }
    if (!form.confirmPassword) {
      e.confirmPassword = "Please confirm your new password.";
    } else if (form.newPassword !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }
    if (
      form.currentPassword &&
      form.newPassword &&
      form.currentPassword === form.newPassword
    ) {
      e.newPassword = "New password must be different from current.";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.values(validationErrors).some((v) => v)) return;

    setBanner(null);
    try {
      await changePassword.mutateAsync({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setBanner({
        type: "success",
        text: "Password updated successfully.",
      });
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setBanner({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Couldn't update password. Please check your current password.",
      });
    }
  };

  return (
    <section className="w-full max-w-3xl">
      <div className="mb-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          Settings
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Security
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your password and account security.
        </p>
      </div>

      <Card className="p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Lock size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Change Password</h3>
            <p className="text-xs text-slate-500">
              Update your password regularly for security.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field label="Current Password" error={errors.currentPassword}>
            <PasswordInput
              placeholder="Enter current password"
              value={form.currentPassword}
              onChange={handleChange("currentPassword")}
              error={!!errors.currentPassword}
              autoComplete="current-password"
            />
          </Field>
          <Field label="New Password" error={errors.newPassword}>
            <PasswordInput
              placeholder="Enter new password"
              value={form.newPassword}
              onChange={handleChange("newPassword")}
              error={!!errors.newPassword}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm New Password" error={errors.confirmPassword}>
            <PasswordInput
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              error={!!errors.confirmPassword}
              autoComplete="new-password"
            />
          </Field>

          {banner && (
            <p
              className={`text-xs rounded-lg px-3 py-2 border ${
                banner.type === "success"
                  ? "text-green-600 bg-green-50 border-green-200"
                  : "text-red-600 bg-red-50 border-red-200"
              }`}
            >
              {banner.type === "success" ? "✓ " : "⚠ "}
              {banner.text}
            </p>
          )}

          <div className="flex justify-end">
            <PrimaryButton type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? "Updating..." : "Update Password"}
            </PrimaryButton>
          </div>
        </form>
      </Card>

      <Card className="p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <Smartphone size={16} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">
                Two-Factor Authentication
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Add an extra layer of security to your account. Coming soon.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 border border-slate-300 rounded-full px-2 py-0.5">
            Coming Soon
          </span>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
            <Shield size={16} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Active Sessions</h3>
            <p className="text-xs text-slate-500">
              Devices currently logged into your account.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
              <Key size={16} className="text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">
                Current Session
              </p>
              <p className="text-xs text-slate-500">This device • Active now</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
            Active
          </span>
        </div>
      </Card>
    </section>
  );
};

export default Security;
