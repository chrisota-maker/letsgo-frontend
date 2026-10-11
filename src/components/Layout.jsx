import { NavLink, Outlet } from "react-router";

export default function Layout() {
  return (
    <>
      <nav>
        <NavLink to="/day">My Day</NavLink>
        <NavLink to="/peeps">My Peeps</NavLink>
        <NavLink to="/responses">Responses</NavLink>
        <button>Log out</button>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}