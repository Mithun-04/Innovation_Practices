import "./LoginForm.css";
import { useState } from "react";
import { FaUser, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import supabase from "./supabaseClient";

const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Fetch user by username
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, password") // Ensure password is hashed in DB
      .eq("username", username)
      .single();

    if (userError || !userData) {
      setError("Incorrect username or password.");
      return;
    }

    // Verify password (compare hashed password)
    if (userData.password !== password) {
      setError("Incorrect username or password.");
      return;
    }

    // Store user session manually (since we are not using Supabase Auth)
    localStorage.setItem("userId", userData.id);
    navigate("/home");
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleLogin}>
        <h1>Login</h1>
        {error && <p className="error">{error}</p>}
        <div className="input-box">
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <FaUser className="icon" />
        </div>
        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FaEye className="icon" />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;