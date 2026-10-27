import { NavLink } from "react-router";

// The pill tabs at the top of the Responses pages.
export default function ResponsesTabs() {
  return (
    <nav className="subtabs" aria-label="Responses">
      <NavLink to="/responses" end>Coming to mine</NavLink>
      <NavLink to="/responses/joining">I'm joining</NavLink>
    </nav>
  );
}