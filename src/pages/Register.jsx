import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";


export default function Register(){
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState(null);


    async function handleRegistrationCommit (e) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.target);

        try{
            const data = await apiFetch("/users/register", {
                method: "POST",
                body: {
                    username: formData.get("username"),
                    password: formData.get("password"),
                    display_name: formData.get("display_name"),
                },
            });
            login(data.token);
            navigate("/day");
        } catch (err) {
            setError(err.message);
        }
    }



    return(
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
        <h1 className="wordmark">Create Account</h1>
        <p className="tagline">Welcome, let's get you set up!</p>
      </header>

      <form className="auth-form" onSubmit={handleRegistrationCommit}>
        <label htmlFor="display_name" className="sr-only">Nickname</label>
        <input
          id="display_name"
          className="field"
          type="text"
          name="display_name"
          placeholder="Nickname"
          autoComplete="nickname"
          required
        />
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
          autoComplete="new-password"
          required
        />
        <button type="submit" className="btn">LetsGo!</button>
        {error && <p role="alert" className="alert">{error}</p>}
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/" className="link">Log in</Link>
      </p>
    </div>
    );
}