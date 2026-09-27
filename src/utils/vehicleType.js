// Same matching rules the Form 22 screens use: vehicleType is free text from
// the backend ("Rikshaw", "Rickshaw", "Cargo", "Loader"...).
export const matchesVehicleType = (item, type) => {
  if (type === "all") return true;
  const v = String(item.vehicleType || "").toLowerCase();
  return type === "rikshaw"
    ? v.includes("rikshaw") || v.includes("rickshaw")
    : v.includes("cargo") || v.includes("loader");
};
