import { useContext, useState } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";

function Login() {
  const [error, setError] = useState(""); // Stores error messages
  const [isLoading, setIsLoading] = useState(false); // Controls loading state

  const { updateUser } = useContext(AuthContext); // Access AuthContext to update user state
  const navigate = useNavigate(); // Hook for navigation

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const username = formData.get("username").trim();
    const password = formData.get("password").trim();

    // Basic validation before sending request
    if (!username || !password) {
      setError("Username and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiRequest.post("/auth/login", { username, password });

      updateUser(res.data); // Store user data in context
      navigate("/"); // Redirect to homepage
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Welcome Back</h1>

          <input
            name="username"
            required
            minLength={3}
            maxLength={20}
            type="text"
            placeholder="Username"
          />

          <input
            name="password"
            type="password"
            required
            placeholder="Password"
          />

          <button disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>

          {error && <span className="errorMessage">{error}</span>}

          <Link to="/register">Don't have an account? Sign up</Link>
        </form>
      </div>

      {/* Optional Image Section */}
      <div className="imgContainer">
        {/* Add an image here if needed */}
      </div>
    </div>
  );
}

export default Login;
