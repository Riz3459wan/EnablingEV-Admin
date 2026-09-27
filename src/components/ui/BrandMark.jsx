import logoMark from "../../assets/logo/logo-mark.webp";

// The company emblem (yellow ring + blue "e" bolt) from the old site's logo.
// Decorative: the "EnablingEV" text next to it carries the accessible name.
const BrandMark = ({ className = "h-9 w-auto" }) => (
  <img
    src={logoMark}
    alt=""
    width={144}
    height={129}
    decoding="async"
    className={className}
  />
);

export default BrandMark;
