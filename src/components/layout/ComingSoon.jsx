import { Construction } from "lucide-react";
import { Link } from "react-router";

const ComingSoon = ({ title }) => (
  <div className="min-h-[70vh] flex items-center justify-center px-4 py-24 text-center">
    <div>
      <div className="bg-orange-50 border border-orange-200 w-14 h-14 rounded-xl flex items-center justify-center mb-5 mx-auto">
        <Construction size={26} className="text-orange-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2 text-slate-800">{title}</h1>
      <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
        This screen is queued for migration to the new design system in the next
        batch.
      </p>
      <Link
        to="/adminDash"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default ComingSoon;
