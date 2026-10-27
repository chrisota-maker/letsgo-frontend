import { NavLink } from "react-router";

// The pill tabs at the top of every My Peeps page.
// NavLink adds the "active" class to whichever tab matches the current URL.
export default function PeepsTabs() {
  return (
    <nav className="subtabs" aria-label="My Peeps">
      {/* "end" means only an exact match on /peeps counts as active,
          so this tab isn't also lit up on /peeps/day or /peeps/find. */}
      <NavLink to="/peeps" end>Up To</NavLink>
      <NavLink to="/peeps/day">Day View</NavLink>
      <NavLink to="/peeps/find">Find Friend</NavLink>
    </nav>
  );
}