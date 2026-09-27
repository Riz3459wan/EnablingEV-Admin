import {
  Truck,
  Users,
  IndianRupee,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import CountUp from "./shared/CountUp";

import { formatINR } from "./utils";

const HeroCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  gradient,
  onClick,
  delay = 0,
}) => (
  <button
    onClick={onClick}
    className={`group relative overflow-hidden w-full text-left rounded-2xl p-4 ${gradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] animate-slide-up`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/20 blur-2xl animate-pulse-slow" />
    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    <div className="relative z-10 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-black leading-tight tabular">{value}</p>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/90 mt-0.5">
          {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend}
          <span className="text-white/60 font-normal">vs last month</span>
        </div>
      </div>
    </div>
  </button>
);

const HeroCards = ({
  onVehiclesClick,
  onDealersClick,
  onSalesClick,
  vehicles: VEHICLES,
  dealers: DEALERS,
  sales: SALES,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <HeroCard
      icon={Truck}
      label="Total Vehicles"
      value={<CountUp end={VEHICLES.total} />}
      trend="11%"
      trendUp={true}
      gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600"
      onClick={onVehiclesClick}
      delay={0}
    />
    <HeroCard
      icon={Users}
      label="Total Dealers"
      value={<CountUp end={DEALERS.total} />}
      trend="12%"
      trendUp={true}
      gradient="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600"
      onClick={onDealersClick}
      delay={80}
    />
    <HeroCard
      icon={IndianRupee}
      label="Sales This Month"
      value={formatINR(SALES.thisMonth)}
      trend="18%"
      trendUp={true}
      gradient="bg-gradient-to-br from-purple-500 via-fuchsia-600 to-pink-600"
      onClick={onSalesClick}
      delay={160}
    />
  </div>
);

export default HeroCards;
