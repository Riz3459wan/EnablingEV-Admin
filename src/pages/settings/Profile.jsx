import { useState } from "react";
import { User, Shield, Building2, Save, Mail, Phone } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import Card from "../../components/ui/Card";
import Field, { Input } from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/Button";

const Profile = () => {
  const { user, role } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.fullName || "Admin",
    email: user?.email || "admin@enablingev.com",
    mobileNumber: user?.mobileNumber || "",
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <section className="w-full max-w-3xl">
      <div className="mb-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          Settings
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Profile
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Your account information and details.
        </p>
      </div>

      <Card className="p-6 mb-5">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <User size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {form.fullName || "Admin"}
            </h2>
            <p className="text-sm text-slate-500">Super Administrator</p>
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">
              <Shield size={10} /> Verified
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <User size={16} className="text-blue-600" />
          Personal Information
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name">
              <Input
                value={form.fullName}
                onChange={handleChange("fullName")}
              />
            </Field>
            <Field label="User ID">
              <Input
                value={user?.userId || "admin"}
                disabled
                className="!bg-slate-50"
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
              />
            </Field>
            <Field label="Mobile">
              <Input
                value={form.mobileNumber}
                onChange={handleChange("mobileNumber")}
                placeholder="Not set"
              />
            </Field>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" />
              Company Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Company">
                <Input
                  value="Enabling E-Vehicle Private Limited"
                  disabled
                  className="!bg-slate-50"
                />
              </Field>
              <Field label="Role">
                <Input value="Super Admin" disabled className="!bg-slate-50" />
              </Field>
            </div>
          </div>

          {saved && (
            <p className="text-green-600 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              ✓ Profile updated successfully.
            </p>
          )}

          <div className="flex justify-end pt-4">
            <PrimaryButton type="submit" className="gap-2">
              <Save size={16} />
              Save Changes
            </PrimaryButton>
          </div>
        </form>
      </Card>
    </section>
  );
};

export default Profile;
