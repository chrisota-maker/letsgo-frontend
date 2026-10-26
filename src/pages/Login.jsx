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
    <div className="auth-page">
      {/* Decorative corner: yellow fill with the orange ribbon */}
      <svg className="corner" viewBox="0 0 284 300" aria-hidden="true">
        <defs>
          <linearGradient id="corner-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFE7A8" />
            <stop offset="1" stopColor="#FFF6DD" />
          </linearGradient>
          <linearGradient id="corner-ribbon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFC93C" />
            <stop offset="1" stopColor="#FF8A3D" />
          </linearGradient>
        </defs>
        <path d="M0 0 H218 C196 76 62 52 80 124 C94 182 36 190 0 228 Z" fill="url(#corner-fill)" />
        <path
          d="M224 -12 C202 76 62 52 80 124 C94 182 36 190 -12 240"
          fill="none"
          stroke="url(#corner-ribbon)"
          strokeWidth="20"
          strokeLinecap="round"
        />
      </svg>

      <header className="auth-brand">
        <h1 className="wordmark">LetsGo</h1>
        <p className="tagline">share your day</p>
      </header>

      <form className="auth-form" onSubmit={handleLoginCommit}>
        <label htmlFor="username" className="sr-only">Username</label>
        <input
          id="username"
          className="field"
          type="text"
          name="username"
          placeholder="Username"
          autoComplete="username"
          required
        />
        <label htmlFor="password" className="sr-only">Password</label>
        <input
          id="password"
          className="field"
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          required
        />
        <button type="submit" className="btn">Log in</button>
        {error && <p role="alert" className="alert">{error}</p>}
      </form>

      <p className="auth-switch">
        New here? <Link to="/register" className="link">Create an account</Link>
      </p>
    </div>
  );
}