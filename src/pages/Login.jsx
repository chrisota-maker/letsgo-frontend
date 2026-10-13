import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";

//"autoComplete" is a standard HTML attribute that tells the browser what type of data is entered. This enables the user's saved username dropdown, password manager autofill, and the offer to save credentials after a successful login.
//"required" is a standard HTML attribute that tells the browser the field is required. It enables standard browser behavior: it prevents the submit, shows an error message, and moves the cursor to the empty field.

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  async function handleLoginCommit(e) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.target);

    try {
      const data = await apiFetch("/users/login", {
        method: "POST",
        body: {
          username: formData.get("username"),
          password: formData.get("password"),
        },
      });
      login(data.token);
      navigate("/day");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h1>LetsGo</h1>
      <p>share your day</p>
      <form onSubmit={handleLoginCommit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          name="username"
          placeholder="Username"
          autoComplete="username"
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          required
        />
        <button type="submit">Log in</button>
        {error && <p role="alert">{error}</p>}
      </form>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </>
  );
}