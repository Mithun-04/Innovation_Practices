import "./LoginForm.css";
import { useState } from "react";
import { FaUser, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabaseUrl = "https://ayblkwfzlmtlmsheoabf.supabase.co";  // Replace with your Supabase URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5Ymxrd2Z6bG10bG1zaGVvYWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2Mzg2MDIsImV4cCI6MjA1NTIxNDYwMn0.3tUK2A9lsr-xvH7V30vCC3nnLknNOwwS3Z1F5TiW39s";  // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    navigate("/home"); // Redirects to Page2 after login
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
