import { Navigate, NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

export default function Layout() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // If nobody is logged in, send them to the login page.
  if (!token) {
    return <Navigate to="/" replace />;
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      <header className="topbar">
        <p className="wordmark">LetsGo</p>
        <button type="button" className="text-button" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <main className="page">
        <Outlet />
      </main>

      <nav className="tabbar" aria-label="Main">
        <NavLink to="/day">My Day</NavLink>
        <NavLink to="/peeps">My Peeps</NavLink>
        <NavLink to="/responses">Responses</NavLink>
      </nav>
    </>
  );
}