export const Card = ({ className = "", children, hover = false }) => (
  <div
    className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${
      hover ? "hover-lift cursor-pointer" : ""
    } ${className}`}
  >
    {children}
  </div>
);

export default Card;
