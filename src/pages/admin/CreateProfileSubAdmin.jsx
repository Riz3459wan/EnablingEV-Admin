import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, UserPlus } from "lucide-react";
import Card from "../../components/ui/Card";
import Field, { Input, PasswordInput } from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/Button";
import { useCreateSubAdmin } from "../../hooks/useSubAdmins";

const initialData = {
  fullName: "",
  mobileNumber: "",
  email: "",
  address: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
  userId: "",
  password: "",
};

const VALID_TLDS = new Set([
  "com",
  "org",
  "net",
  "co",
  "io",
  "gov",
  "edu",
  "info",
  "biz",
  "me",
  "us",
  "uk",
  "in",
  "ca",
  "de",
  "fr",
  "au",
  "jp",
  "cn",
  "ru",
  "it",
  "br",
  "za",
  "nl",
  "se",
  "no",
  "fi",
  "es",
  "pl",
  "ch",
  "at",
  "dk",
  "ie",
  "pt",
  "hk",
  "tw",
  "kr",
  "sg",
]);

const validate = (formData) => {
  const e = {};
  e.fullName = formData.fullName.trim() ? "" : "Full name is required.";

  if (!formData.mobileNumber.trim()) {
    e.mobileNumber = "Mobile number is required.";
  } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
    e.mobileNumber = "Mobile number must be 10 digits, starting 6-9.";
  }

  if (!formData.email.trim()) {
    e.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    e.email = "Enter a valid email address.";
  } else if (!VALID_TLDS.has(formData.email.split(".").pop().toLowerCase())) {
    e.email = "Enter a valid email address.";
  }

  e.address = formData.address.trim() ? "" : "Address is required.";
  e.city = formData.city.trim() ? "" : "City is required.";
  e.district = formData.district.trim() ? "" : "District is required.";
  e.state = formData.state.trim() ? "" : "State is required.";
  e.pincode = /^\d{6}$/.test(formData.pincode)
    ? ""
    : "PIN code must be exactly 6 digits.";
  e.userId = formData.userId.trim() ? "" : "User ID is required.";
  e.password = formData.password.trim() ? "" : "Password is required.";

  return e;
};

const CreateProfileSubAdmin = () => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const createSubAdmin = useCreateSubAdmin();

  const handleChange = (name) => (e) => {
    let { value } = e.target;
    if (name === "mobileNumber")
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    if (name === "pincode") value = value.replace(/[^0-9]/g, "").slice(0, 6);
    setFormData((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const e = validate(formData);
    setErrors(e);
    if (Object.values(e).some((x) => x)) return;

    setSubmitError("");
    try {
      await createSubAdmin.mutateAsync({
        ...formData,
        role: "subadmin",
      });
      setSuccess(true);
      setFormData(initialData);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          "Failed to create profile. Please try again.",
      );
    }
  };

  if (success) {
    return (
      <section className="w-full flex items-center justify-center min-h-[70vh]">
        <Card className="p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Sub Admin Created
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            The sub-admin profile was created successfully.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <PrimaryButton onClick={() => setSuccess(false)}>
              Create Another
            </PrimaryButton>
            <Link
              to="/adminDash"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-sm border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Create Sub Admin Profile
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Set up login credentials and contact details for a new sub-admin.
        </p>
      </div>

      <Card className="p-6 sm:p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <UserPlus size={18} className="text-blue-600" />
            </div>
            <h2 className="font-semibold text-slate-800">Personal Details</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Full Name" error={errors.fullName}>
                <Input
                  value={formData.fullName}
                  onChange={handleChange("fullName")}
                  error={!!errors.fullName}
                  required
                />
              </Field>
            </div>

            <Field label="Mobile Number" error={errors.mobileNumber}>
              <Input
                type="tel"
                placeholder="10-digit number"
                value={formData.mobileNumber}
                onChange={handleChange("mobileNumber")}
                error={!!errors.mobileNumber}
                required
              />
            </Field>

            <Field label="Email" error={errors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                error={!!errors.email}
                required
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Address" error={errors.address}>
                <Input
                  value={formData.address}
                  onChange={handleChange("address")}
                  error={!!errors.address}
                  required
                />
              </Field>
            </div>

            <Field label="City" error={errors.city}>
              <Input
                value={formData.city}
                onChange={handleChange("city")}
                error={!!errors.city}
                required
              />
            </Field>

            <Field label="District" error={errors.district}>
              <Input
                value={formData.district}
                onChange={handleChange("district")}
                error={!!errors.district}
                required
              />
            </Field>

            <Field label="State" error={errors.state}>
              <Input
                value={formData.state}
                onChange={handleChange("state")}
                error={!!errors.state}
                required
              />
            </Field>

            <Field label="PIN Code" error={errors.pincode}>
              <Input
                placeholder="6-digit PIN"
                value={formData.pincode}
                onChange={handleChange("pincode")}
                error={!!errors.pincode}
                required
              />
            </Field>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h2 className="font-semibold text-slate-800 mb-4">
              Login Credentials
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="User ID" error={errors.userId}>
                <Input
                  value={formData.userId}
                  onChange={handleChange("userId")}
                  error={!!errors.userId}
                  required
                />
              </Field>

              <Field label="Password" error={errors.password}>
                <PasswordInput
                  value={formData.password}
                  onChange={handleChange("password")}
                  error={!!errors.password}
                  required
                />
              </Field>
            </div>
          </div>

          {submitError && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <PrimaryButton
              type="submit"
              disabled={createSubAdmin.isPending}
              className="px-8"
            >
              {createSubAdmin.isPending ? "Creating..." : "Create Profile"}
            </PrimaryButton>
          </div>
        </form>
      </Card>
    </section>
  );
};

export default CreateProfileSubAdmin;
