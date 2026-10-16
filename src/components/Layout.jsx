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
      <nav>
        <NavLink to="/day">My Day</NavLink>
        <NavLink to="/peeps">My Peeps</NavLink>
        <NavLink to="/responses">Responses</NavLink>
        <button onClick={handleLogout}>Log out</button>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}