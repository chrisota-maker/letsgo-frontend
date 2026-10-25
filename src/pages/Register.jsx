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
    <>
      <h1>Create Account</h1>
      <p>Welcome, let's get you set up!</p>
      <form onSubmit={handleRegistrationCommit}>
        <label htmlFor="display_name">Nickname</label>
        <input
          id="display_name"
          type="text"
          name="display_name"
          placeholder="Nickname"
          autoComplete="nickname"
          required
        />
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
          autoComplete="new-password"
          required
        />
        <button type="submit">LetsGo!</button>
        {error && <p role="alert">{error}</p>}
      </form>
      <p>
        Already have an account? <Link to="/">Log in</Link>
      </p>
    </>
    );
}